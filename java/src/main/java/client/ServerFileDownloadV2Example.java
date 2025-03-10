package client;

import org.json.JSONObject;
import org.json.JSONArray;
import java.net.URI;
import java.util.Map;

// Receive one file from demo server using ssh credentials and transferspec v2
public class ServerFileDownloadV2Example {
	public static void main(String... args) throws java.net.URISyntaxException {
		// get simplified testing environment
		final TestEnvironment test_environment = new TestEnvironment();
		// get test server address and credentials
		final Map<String, String> server_conf = (Map<String, String>) test_environment.config.get("server");
		final URI fasp_url = new URI(server_conf.get("url"));
		// transfer spec version 2 (JSON)
		final JSONObject transferSpecV2 = new JSONObject()//
				.put("title", "server upload ts v2")//
				.put("remote_host", fasp_url.getHost())//
				.put("session_initiation", new JSONObject()//
						.put("ssh", new JSONObject()//
								.put("ssh_port", fasp_url.getPort())//
								.put("remote_user", server_conf.get("user"))//
								.put("remote_password", server_conf.get("pass"))))//
				.put("direction", "recv")//
				.put("assets", new JSONObject()//
						.put("destination_root", System.getProperty("java.io.tmpdir"))//
						.put("paths", new JSONArray()//
								.put(new JSONObject()//
										.put("source", "aspera-test-dir-tiny/200KB.1")//
										.put("destination", "downloaded_file"))));

		// execute transfer
		test_environment.start_transfer_and_wait(transferSpecV2.toString());
	}
}
