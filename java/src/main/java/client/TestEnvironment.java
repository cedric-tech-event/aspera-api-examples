package client;

import ibm.aspera.transferservice.Transfer;
import ibm.aspera.transferservice.TransferServiceGrpc;
import io.grpc.ManagedChannelBuilder;
import io.grpc.ManagedChannel;
import org.yaml.snakeyaml.Yaml;

import java.io.IOException;
import java.net.URI;
import java.util.Map;
import java.util.Iterator;

// read configuration file and provide interface for transfer
public class TestEnvironment {
	public Map<String, Object> config;
	private TransferServiceGrpc.TransferServiceBlockingStub client;

	public String getProp(final String name) {
		final String prop_val = System.getProperty(name);
		if (prop_val == null)
			throw new Error("mandatory property not set: " + name);
		return prop_val;
	}

	public TestEnvironment() {
		final String config_filepath = getProp("config_yaml");
		try {
			config = new Yaml().load(new java.io.FileReader(config_filepath));
		} catch (final java.io.FileNotFoundException e) {
			throw new Error(e.getMessage());
		}
		try {
			final URI grpc_url = new URI(config.get("trsdk_url").toString());
			// create channel to socket
			final ManagedChannel channel = ManagedChannelBuilder.forAddress(grpc_url.getHost(), grpc_url.getPort()).usePlaintext().build();
			// create a connection to the transfer sdk daemon
			client = TransferServiceGrpc.newBlockingStub(channel);
		} catch (final java.net.URISyntaxException e) {
			throw new Error("trsdk_url: " + e.getMessage());
		}
		boolean isStarted = false;
		int remaining_try = 2;
		while (!isStarted && remaining_try > 0) {
			try {
				System.out.println("Checking gRPC connection");
				client.getAPIVersion(Transfer.APIVersionRequest.newBuilder().build());
				System.out.println("OK: Daemon is here.");
				isStarted = true;
			} catch (final io.grpc.StatusRuntimeException e) {
				System.out.println("KO: Daemon is not here.");
				try {
					final String daemon_filepath = getProp("daemon");
					final String daconf_filepath = getProp("config_daemon");
					System.out.println("Starting daemon ..." + daemon_filepath + " " + daconf_filepath);
					Runtime.getRuntime().exec(new String[] { daemon_filepath, "-c", daconf_filepath });
					Thread.sleep(2000);
				} catch (final IOException e2) {
					System.out.println("FAILED: cannot start daemon: " + e2.getMessage());
					System.exit(1);
				} catch (final InterruptedException e2) {
					throw new Error(e2.getMessage());
				}
			}
			--remaining_try;
		}
		if (!isStarted) {
			System.out.println("FAILED: API daemon did not start.Please start it manually by executing \"make startdaemon\" in a separate terminal from the top folder.");
			System.exit(1);
		}
	}

	public void start_transfer_and_wait(final String transferSpec) {
		// send start transfer request to transfer sdk daemon
		final Transfer.StartTransferResponse transferResponse = client.startTransfer(Transfer.TransferRequest.newBuilder().setTransferType(Transfer.TransferType.FILE_REGULAR)
				.setConfig(Transfer.TransferConfig.newBuilder().build()).setTransferSpec(transferSpec).build());
		final String transferId = transferResponse.getTransferId();
		System.out.println(String.format("transfer started with id %s", transferId));

		final Iterator<Transfer.TransferResponse> monitorTransferResponse = client.monitorTransfers(Transfer.RegistrationRequest.newBuilder()
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
