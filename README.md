# zigbee-cc2531-tester

Tester for Texas Instruments' [CC2531] module attached to [Raspberry Pi].

## Prerequisites

[JRE] 8 or higher

Note: Unfortunately some underlying dependency inexplicably requires Python.

## Usage

Start it using [Maven Wrapper]:
- On MacOS / Linux 
   ```
   ./mvnw verify
   ```
- On Windows
  ```
  mvnw.cmd verify
  ```
  
[CC2531]: https://www.ti.com/product/CC2531
[Raspberry Pi]: https://www.raspberrypi.org/
[JRE]: https://pl.wikipedia.org/wiki/Java_Runtime_Environment
[Maven Wrapper]: https://maven.apache.org/wrapper/