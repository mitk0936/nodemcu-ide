export async function openSerialPort() {
  // Step 1: Ask the user to select a serial port
  const port = await navigator.serial.requestPort();

  // Step 2: Open the port with a baud rate (e.g., 115200)
  await port.open({ baudRate: 115200 });

  const decoder = new TextDecoderStream();
  const inputDone = port.readable!.pipeTo(decoder.writable);
  const inputStream = decoder.readable;

  const reader = inputStream.getReader();

  const encoder = new TextEncoderStream();
  const outputDone = encoder.readable.pipeTo(port.writable!);
  const writer = encoder.writable.getWriter();

  // Step 3: Start reading and writing
  // Send something to the device
  await writer.write("Hello ESP!\n");

  // Read incoming data line-by-line
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) console.log("📥 Received:", value);
    }
  } catch (error) {
    console.error("Read error:", error);
  } finally {
    reader.releaseLock();
    writer.releaseLock();
    await inputDone;
    await outputDone;
    await port.close();
  }
}
