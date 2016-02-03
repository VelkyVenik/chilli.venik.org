#include <DHT.h>        // https://github.com/adafruit/DHT-sensor-library
#include <OneWire.h>    // https://github.com/PaulStoffregen/OneWire
#include <EEPROM.h>

#define pinClock      8
#define pinData       9
#define oneWireData   10

#define DHTPIN 11         // what digital pin we're connected to
#define DHTTYPE DHT22     // DHT 22  (AM2302), AM2321

byte numbersData[]  = {
  B11101101,    // 0
  B00101000,    // 1
  B11001110,    // 2
  B01101110,    // 3
  B00101011,    // 4
  B01100111,    // 5
  B11100111,    // 6
  B00101100,    // 7
  B11101111,    // 8
  B01101111     // 9
};
byte point = B00010000;  // .

byte animationData1[][3] =
{
  {B00000100, B00000000, B00000000},
  {B00000100, B00000100, B00000000},
  {B00000000, B00000100, B00000100},
  {B00000000, B00000000, B00001100},
  {B00000000, B00000000, B00101000},
  {B00000000, B00000000, B01100000},
  {B00000000, B01000000, B01000000},
  {B01000000, B01000000, B00000000},
  {B11000000, B00000000, B00000000},
  {B10000001, B00000000, B00000000},
  {B00000001, B00000000, B00000000},
  {B00000000, B00000000, B00000000},
};

byte animationData2[][3] =
{
  {B00000000, B00000000, B00000000},
  {B10100000, B10100000, B10100000},
  {B10101001, B10101001, B10101001},
  {B10101101, B10101101, B10101101},
  {B11101101, B11101101, B11101101},
};

byte animationData3[][3] =
{
  {B00000000, B00000000, B00000000},
  {B10000000, B00000000, B00000000},
  {B10000001, B00000000, B00000000},
  {B10100001, B00000000, B00000000},
  {B10101001, B00000000, B00000000},
  {B10101001, B10000000, B00000000},
  {B10101001, B10000001, B00000000},
  {B10101001, B10100001, B00000000},
  {B10101001, B10101001, B00000000},
  {B10101001, B10101001, B10000000},
  {B10101001, B10101001, B10000001},
  {B10101001, B10101001, B10100001},
  {B10101001, B10101001, B10101001},
  {B10101101, B10101001, B10101001},
  {B10101101, B10101101, B10101001},
  {B10101101, B10101101, B10101101},
  {B11101101, B10101101, B10101101},
  {B11101101, B11101101, B10101101},
  {B11101101, B11101101, B11101101},
};

OneWire  ds(oneWireData);  // on pin 10 (a 4.7K resistor is necessary)
DHT dht(DHTPIN, DHTTYPE);

void startAnimation()
{
  for (int ii = 0; ii < 2; ii++)
  {
    for (int i = 0; i < 11; i++)
    {
      noInterrupts();
      shiftOut(pinData, pinClock, MSBFIRST, animationData1[i][2]);
      shiftOut(pinData, pinClock, MSBFIRST, animationData1[i][1]);
      shiftOut(pinData, pinClock, MSBFIRST, animationData1[i][0]);
      interrupts();
      delay(80);
    }
  }

  for (int i = 0; i < 19; i++)
  {
    noInterrupts();
    shiftOut(pinData, pinClock, MSBFIRST, animationData3[i][2]);
    shiftOut(pinData, pinClock, MSBFIRST, animationData3[i][1]);
    shiftOut(pinData, pinClock, MSBFIRST, animationData3[i][0]);
    interrupts();
    delay(80);
  }
}

void setup() {
  pinMode(pinClock, OUTPUT);
  pinMode(pinData, OUTPUT);

  ADMUX = 0xC8;         // Internal temperature sensor

  Serial.begin(9600);

  dht.begin();          //DHT22 sensor

  //  startAnimation();
  
}


float readWireTemp()
{
  byte i;
  byte present = 0;
  byte type_s;
  byte data[12];
  byte addr[8];
  float celsius;

  ds.reset_search();
  if ( !ds.search(addr)) {
    Serial.println("ERR No more addresses.");
    ds.reset_search();
    delay(250);
    return 0;
  }

  if (OneWire::crc8(addr, 7) != addr[7]) {
    Serial.println("ERR CRC is not valid!");
    return 0;
  }

  // the first ROM byte indicates which chip
  switch (addr[0]) {
    case 0x10:
      //      Serial.println("  Chip = DS18S20");  // or old DS1820
      type_s = 1;
      break;
    case 0x28:
      //      Serial.println("  Chip = DS18B20");
      type_s = 0;
      break;
    case 0x22:
      //      Serial.println("  Chip = DS1822");
      type_s = 0;
      break;
    default:
      Serial.println("ERR Device is not a DS18x20 family device.");
      return 0;
  }

  ds.reset();
  ds.select(addr);
  ds.write(0x44, 1);        // start conversion, with parasite power on at the end

  delay(1000);     // maybe 750ms is enough, maybe not
  // we might do a ds.depower() here, but the reset will take care of it.

  present = ds.reset();
  ds.select(addr);
  ds.write(0xBE);         // Read Scratchpad

  for ( i = 0; i < 9; i++) {           // we need 9 bytes
    data[i] = ds.read();
  }

  // Convert the data to actual temperature
  // because the result is a 16 bit signed integer, it should
  // be stored to an "int16_t" type, which is always 16 bits
  // even when compiled on a 32 bit processor.
  int16_t raw = (data[1] << 8) | data[0];
  if (type_s) {
    raw = raw << 3; // 9 bit resolution default
    if (data[7] == 0x10) {
      // "count remain" gives full 12 bit resolution
      raw = (raw & 0xFFF0) + 12 - data[6];
    }
  } else {
    byte cfg = (data[4] & 0x60);
    // at lower res, the low bits are undefined, so let's zero them
    if (cfg == 0x00) raw = raw & ~7;  // 9 bit resolution, 93.75 ms
    else if (cfg == 0x20) raw = raw & ~3; // 10 bit res, 187.5 ms
    else if (cfg == 0x40) raw = raw & ~1; // 11 bit res, 375 ms
    //// default is 12 bit resolution, 750 ms conversion time
  }

  celsius = (float)raw / 16.0;
  return celsius;
}

float getSoilTemp()
{
  float temp = 0;

  for (int i = 0; i < 3; i++)
  {
    temp += readWireTemp();
  }

  return temp / 3;
}

float getSysTemp(void)
{
  unsigned int wADC;
  double t;

  // The internal temperature has to be used
  // with the internal reference of 1.1V.
  // Channel 8 can not be selected with
  // the analogRead function yet.

  // Set the internal reference and mux.
  ADMUX = (_BV(REFS1) | _BV(REFS0) | _BV(MUX3));
  ADCSRA |= _BV(ADEN);  // enable the ADC

  delay(20);            // wait for voltages to become stable.

  ADCSRA |= _BV(ADSC);  // Start the ADC

  // Detect end-of-conversion
  while (bit_is_set(ADCSRA, ADSC));

  // Reading register "ADCW" takes care of how to read ADCL and ADCH.
  wADC = ADCW;

  // The offset of 324.31 could be wrong. It is just an indication.
  t = (wADC - 324.31 ) / 1.22;

  // The returned temperature is in degrees Celcius.
  return (t);
}

void displayValue(int v, int p)
{
  noInterrupts();
  shiftOut(pinData, pinClock, MSBFIRST, numbersData[v - v / 10 * 10] | (p == 0)*point);
  shiftOut(pinData, pinClock, MSBFIRST, numbersData[(v - v / 100 * 100) / 10] | (p == 1)*point);
  shiftOut(pinData, pinClock, MSBFIRST, numbersData[v / 100] | (p == 2)*point);
  interrupts();
}

void loop() {
  // Soil temperature
  float soilTemp = getSoilTemp();
  float sysTemp = getSysTemp();
  displayValue((int) (soilTemp * 10), 1);

  float airHum = dht.readHumidity();
  float airTemp = dht.readTemperature();
  if (isnan(airHum) || isnan(airTemp)) {
    Serial.println("ERR Failed to read from DHT sensor!");
    return;
  }

  char buffer[128];
  snprintf(buffer, 128, "START soilTemp=%d.%d ardTemp=%d.%d airHum=%d.%d airTemp=%d.%d END\n",
           (int)soilTemp, (int) ((soilTemp - (float)((int) soilTemp)) * 100),
           (int)sysTemp, (int) ((sysTemp - (float)((int) sysTemp)) * 100),
           (int)airHum, (int) ((airHum - (float)((int) airHum)) * 100),
           (int)airTemp, (int) ((airTemp - (float)((int) airTemp)) * 100)
          );
  Serial.print(buffer);
  
  // How to parse it in Bash
  // retval=$(cat /dev/ttyUSBxx)
  // for i in $retval; do echo $i | sed -e "s/=.*//"; echo $i | sed -e "s/.*=//"; done

  delay(500);
}

