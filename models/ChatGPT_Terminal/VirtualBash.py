import subprocess
import os
from flask import Flask, request

app = Flask(__name__)

# Handle POST requests to /execute
@app.route("/execute", methods=["POST"])
def execute():
  # Get the command from the request body
  command = request.form["command"]

  # Create a virtual environment
  virtual_env_dir = os.path.join(os.getcwd(), "venv")
  if not os.path.isdir(virtual_env_dir):
      subprocess.run(["python", "-m", "venv", "venv"], check=True)
  activate_script = os.path.join(virtual_env_dir, "bin", "activate")

  # Run the command within the virtual environment
  with subprocess.Popen(["bash", "-c", f"source {activate_script} && {command}"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=False) as proc:
    stdout, stderr = proc.communicate()

  # Check for errors
  if proc.returncode != 0:
    # If there is an error, send an error response to the client
    return stderr.decode("utf-8"), 500
  else:
    # If there is no error, send the output to the client
    return stdout.decode("utf-8"), 200

# Start the server on port 5000
if __name__ == '__main__':
    app.run(debug=False, port=5000)