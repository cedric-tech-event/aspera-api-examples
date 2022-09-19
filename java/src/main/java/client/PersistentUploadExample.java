package client;

import ibm.aspera.transferservice.Transfer;
import org.json.JSONObject;
import org.json.JSONArray;
import java.net.URI;
import java.util.Map;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Iterator;
import java.util.Timer;
import java.util.TimerTask;

public class PersistentUploadExample {

	public static class FileUploadTask extends TimerTask {
		private int seq;
		private final TestEnvironment mTestEnv;
		private final int mMax;

		FileUploadTask(final TestEnvironment aTestEnv, int aMax) {
			seq = 0;
			mTestEnv = aTestEnv;
            mMax=aMax;
		}

		// this is the recurring task
		public void run() {
			try {
				System.out.println("T: >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
				System.out.println(String.format("T: Task %d scheduled ...executing now", seq));
				// generate example file to transfer
				final String fileName = String.format("file%03d", seq);
				final File file = new File(fileName);
				final FileWriter writer = new FileWriter(file);
				writer.write(String.format("Hello World %d!", seq));
				++seq;
				writer.close();
				// add paths to persistent session
				final Transfer.TransferPathRequest transferPathRequest =
					Transfer.TransferPathRequest.newBuilder()
					.setTransferId(mTestEnv.transferId)
					.addTransferPath(Transfer.TransferPath.newBuilder()
						.setSource(file.getAbsolutePath())
						.setDestination(fileName)
						.build())
					.build();
                System.out.println("T: adding transfer path");
                mTestEnv.client.addTransferPaths(transferPathRequest);
				System.out.println("T: end task");
			} catch (final IOException e) {
				System.out.println("T: ERROR: " + e.getMessage());
			}
		}
	} // FileUploadTask

	public static void main(String...args) throws IOException, java.net.URISyntaxException {
		final int max_files = 10;
		// get simplified testing environment, ensures that transfer daemon is started
		final TestEnvironment test_environment = new TestEnvironment();
		// get test server address and credentials from configuration file
		final Map<String, String> server_conf = (Map<String, String> ) test_environment.config.get("server");
		final URI fasp_url = new URI(server_conf.get("url"));
		// transfer spec version 1 (JSON)
		final JSONObject transferSpec = new JSONObject()
			.put("title", "server upload V1")
			.put("remote_host", fasp_url.getHost())
			.put("ssh_port", fasp_url.getPort())
			.put("remote_user", server_conf.get("user"))
			.put("remote_password", server_conf.get("pass"))
			.put("direction", "send")
			.put("destination_root", "/Upload");
		// start persistent transfer session
		test_environment.start_transfer(transferSpec.toString(), Transfer.TransferType.FILE_PERSISTENT);

		final TimerTask timerTask = new FileUploadTask(test_environment,max_files);
		final Timer timer = new Timer(true);
		timer.scheduleAtFixedRate(timerTask, 3000, 2000); // 1.task 2.delay(ms) 3.period(ms)

		test_environment.wait_transfer();

		System.out.println("!!!!!!!!!!!!!!!!!!!!!!!!!!!lock persistent transfer");
		// end the persistent session
		test_environment.client.lockPersistentTransfer(Transfer.LockPersistentTransferRequest
			.newBuilder()
			.setTransferId(test_environment.transferId)
			.build());

	}
}