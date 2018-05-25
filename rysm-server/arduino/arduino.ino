#include <SPI.h>
#include <RFID.h>

#include "HX711.h"

#define SS_PIN 10
#define RST_PIN 9

#define DOUT  A1
#define CLK  A0

HX711 balanza(DOUT, CLK);

RFID rfid(SS_PIN,RST_PIN);

String id = "";

void setup() {
  Serial.begin(9600);
  SPI.begin();
  rfid.init();
  
  balanza.read();
  balanza.set_scale(439430.25);
  balanza.tare(20);
}

void loop() {
  float kg = balanza.get_units(20);
  float gr = kg*1000;
  if(rfid.isCard()) {
    if(rfid.readCardSerial()) {
        id = (String) rfid.serNum[0] + (String) rfid.serNum[1]
        + (String) rfid.serNum[2] + (String) rfid.serNum[3] + (String) rfid.serNum[4];
        Serial.print(";" + id + ";" + ":" + (String) gr + ":");
      }
  }
  delay(1000);
  rfid.halt();
}
