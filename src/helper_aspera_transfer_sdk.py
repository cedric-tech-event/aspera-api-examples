import grpc
import json
import transfer_pb2 as transfer_manager
import transfer_pb2_grpc as transfer_manager_grpc
import os
import subprocess

SDK_GRPC_ADDR = '127.0.0.1'
SDK_GRPC_PORT = 55002


def start_transfer_and_wait(transfer_spec):
    # create a connection to the transfer manager daemon
    channel = grpc.insecure_channel(SDK_GRPC_ADDR + ':' + str(SDK_GRPC_PORT))
    # try to start daemon a few times if needed
    for i in range(0, 2):
        try:
            print('Checking gRPC connection')
            grpc.channel_ready_future(channel).result(timeout=3)
        except grpc.FutureTimeoutError:
            print('FAILED: trying to start daemon')
            # else prepare config and start
            bin_folder = os.environ['TRANSFERSDK_ARCH']
            config = {
                'address': SDK_GRPC_ADDR,
                'port': SDK_GRPC_PORT,
                'fasp_runtime': {
                    'use_embedded': False,
                    'user_defined': {
                        'bin':bin_folder,
                        'etc':os.environ['TRANSFERSDK_NOARCH'],
                    }
                }
            }
            conf_file = os.path.join(os.environ['TMPDIR'], 'sdk.conf')
            log_base = os.path.join(os.environ['TMPDIR'], 'daemon')
            with open(conf_file, 'w') as the_file:
                the_file.write(json.dumps(config))
            command = [os.path.join(bin_folder, 'asperatransferd'), '--config' , conf_file]
            process = subprocess.run(' '.join(command) + '>' + log_base + '.out 2>' + log_base + '.err &', shell=True, capture_output=True, check=True)
            continue
        print('SUCCESS')
        break
    # channel is ok, let's get the stub
    aspera = transfer_manager_grpc.TransferServiceStub(channel)
    # create a transfer request
    transfer_request = transfer_manager.TransferRequest(
        transferType=transfer_manager.FILE_REGULAR,
        config=transfer_manager.TransferConfig(),
        transferSpec=json.dumps(transfer_spec))
    # send start transfer request to transfer manager daemon
    transfer_response = aspera.StartTransfer(transfer_request)
    transfer_id = transfer_response.transferId
    print('transfer started with id {0}'.format(transfer_id))
    # monitor transfer status
    for transfer_info in aspera.MonitorTransfers(
            transfer_manager.RegistrationRequest(
                filters=[transfer_manager.RegistrationFilter(
                    transferId=[transfer_id]
                )])):
        print(">>>>>>>>>>>>>>>>>>>>>>>>>>>>\ntransfer info {0}".format(transfer_info))
        # check transfer status in response, and exit if it's done
        status = transfer_info.status
        # exit on first success or failure
        if status == transfer_manager.COMPLETED:
            print('finished {0}'.format(status))
            break
        if status == transfer_manager.FAILED:
            raise Exception(transfer_info.message)
