// Render settings for every Dhwanikul film. See README.md for the commands.
import {Config} from '@remotion/cli/config';

// Lossless PNG frames: the flat print colours must not pick up JPEG noise before encoding.
Config.setVideoImageFormat('png');
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setOverwriteOutput(true);

// On a Mac Remotion downloads its own headless Chrome. In a container that already
// has one, point REMOTION_BROWSER_EXECUTABLE at it.
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}
