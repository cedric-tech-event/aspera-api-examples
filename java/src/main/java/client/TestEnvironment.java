package client;

import ibm.aspera.transferservice.Transfer;
import ibm.aspera.transferservice.TransferServiceGrpc;
import io.grpc.ManagedChannelBuilder;
import org.yaml.snakeyaml.Yaml;
import java.net.URI;
import java.util.Map;
import java.util.Iterator;

// read configuration file and provide interface for transfer
public class TestEnvironment {
	public Map<String, Object> config;
	private TransferServiceGrpc.TransferServiceBlockingStub client;

	public TestEnvironment() throws java.io.FileNotFoundException, java.net.URISyntaxException {
		config = new Yaml().load(new java.io.FileReader(System.getProperty("config_yaml")));
		final URI grpc_url = new URI(config.get("trsdk_url").toString());
		// create a connection to the transfer sdk daemon
		client = TransferServiceGrpc.newBlockingStub(ManagedChannelBuilder.forAddress(grpc_url.getHost(), grpc_url.getPort()).usePlaintext().build());
	}

	public void start_transfer_and_wait(String transferSpec) {
		// send start transfer request to transfer sdk daemon
		final Transfer.StartTransferResponse transferResponse = client.startTransfer(Transfer.TransferRequest.newBuilder().setTransferType(Transfer.TransferType.FILE_REGULAR)
				.setConfig(Transfer.TransferConfig.newBuilder().build()).setTransferSpec(transferSpec).build());
		final String transferId = transferResponse.getTransferId();
		System.out.println(String.format("transfer started with id %s", transferId));

		Iterator<Transfer.TransferResponse> monitorTransferResponse = client.monitorTransfers(Transfer.RegistrationRequest.newBuilder()
				.addFilters(Transfer.RegistrationFilter.newBuilder().setOperator(Transfer.RegistrationFilterOperator.OR).addTransferId(transferId).build()).build());

		// monitor transfer until it finishes
		for (Transfer.TransferResponse info = monitorTransferResponse.next(); monitorTransferResponse.hasNext(); info = monitorTransferResponse.next()) {
			System.out.println("transfer info " + info);
			System.out.println("file info " + info.getFileInfo());
			System.out.println("transfer event " + info.getTransferEvent());

			if (info.getStatus() == Transfer.TransferStatus.FAILED || info.getStatus() == Transfer.TransferStatus.COMPLETED
					|| info.getTransferEvent() == Transfer.TransferEvent.FILE_STOP) {
				System.out.println("upload finished " + info.getStatus().toString());
				break;
			}
		}

	}
}
