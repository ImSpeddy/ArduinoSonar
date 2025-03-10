#include <Servo.h>

#define SERVO_PIN 3

#define US_TRIG 4
#define US_ECHO 5

// TODO: Setup Servo
// TODO: Setup Ultrasonic Sensor

uint8_t ServoStart = 0;
uint8_t ServoEnd = 0;

bool ServoStartInit = false;
bool ServoEndInit = false;

uint16_t delayRate = 0;
uint8_t interval = 0;

bool delayRateInit = false;
bool intervalInit = false;

bool active = false;

bool direction = true;

/*
    true  | clockwise
    false | counterclockwise
*/

uint8_t servoPosition = 0;

Servo motor;

void setup(){
    Serial.begin(9600);

    pinMode(US_TRIG, OUTPUT);
    pinMode(US_ECHO, INPUT);

    motor.attach(SERVO_PIN);
    setServo(servoPosition);
}

void loop(){
    if(Serial.available() > 0){
        char read = Serial.read();

        /*
            Command | Name            | Syntax | Argument Info
            S       | Start Position  | SXXX   | XXX: uint8_t, Trailing 0's (must use three spaces)
            E       | End Position    | EXXX   | XXX: uint8_t, Trailing 0's (must use three spaces)
            R       | Delay Rate      | RXXXXX | XXXXX: uint16_t, Trailing 0's (must use five spaces)
            I       | Servo Interval  | IXXX   | XXX: uint8_t, Trailing 0's (must use three spaces)
            A       | Stop            | A      | none 

        */

        if(read == 'S'){

            uint8_t readHun = (Serial.read() - '0') * 100;
            uint8_t readTen = (Serial.read() - '0') * 10;
            uint8_t readUni = Serial.read() - '0';

            uint8_t startPosition = readHun + readTen + readUni;

            if(startPosition <= 179){
                ServoStart = startPosition;
                ServoStartInit = true;

                setServo(ServoStart);
            }

        }else if (read == 'E'){
            
            uint8_t readHun = (Serial.read() - '0') * 100;
            uint8_t readTen = (Serial.read() - '0') * 10;
            uint8_t readUni = Serial.read() - '0';

            uint8_t endPosition = readHun + readTen + readUni;

            if(endPosition <= 180){
                if(ServoStartInit == true && ServoStart < endPosition){
                    ServoEnd = endPosition;
                    ServoEndInit = true;
                }
            }

        }else if (read == 'R'){
            

            uint8_t readTTh = (Serial.read() - '0') * 10000;
            uint8_t readTho = (Serial.read() - '0') * 1000;
            uint8_t readHun = (Serial.read() - '0') * 100;
            uint8_t readTen = (Serial.read() - '0') * 10;
            uint8_t readUni = Serial.read() - '0';

            delayRate = readTTh + readTho + readHun +readTen + readUni;
            delayRateInit = true;

        }else if (read == 'I'){
            uint8_t readHun = (Serial.read() - '0') * 100;
            uint8_t readTen = (Serial.read() - '0') * 10;
            uint8_t readUni = Serial.read() - '0';

            uint8_t intervalRead = readHun + readTen + readUni;

            if(intervalRead <= 179){
                interval = intervalRead;
                intervalInit = true;
            }

        }else if (read == 'A'){
            ServoStart = 0;
            ServoEnd = 0;
            ServoStartInit = false;
            ServoEndInit = false;
            delayRate = 0;
            interval = 0;
            delayRateInit = false;
            intervalInit = false;
            active = false;
        }

        if(ServoStartInit == true && ServoEndInit == true && delayRateInit == true && intervalInit == true){
            active = true;
        }
    }

    if(active == true){

        /*
        
            Command | Name                    | Syntax | Argument Info
            G       | Angle                   | GXXX   | XXX: uint8_t, Trailing 0's (must use three spaces)
            D       | Distance                | DXXXXX | XXXXX: float (positive), first XXX are integers (must use three spaces), the last two XXX are decimals (must use two spaces)
            L       | Limit                   | L      | none

        */
        
        float pulseDistance = getDistance();
        int distance = 0;
        
        if(pulseDistance > 1000){
            distance = 10000;
        }else{
            distance = pulseDistance * 100;
        }

        String strDistance = String(distance);
        String distanceCmd = "G";
        distanceCmd.concat(strDistance);
        String position = String(servoPosition);
        String positionCmd = "D";
        positionCmd.concat(position);
        String command;

        command.concat(distanceCmd);
        command.concat(positionCmd);

        Serial.println(command);

        if(direction == true){
            if(ServoEnd <= servoPosition + interval){
                setServo(ServoEnd);
                Serial.println("L");
                direction = false;
            }else{
                setServo(servoPosition + interval);
            }
        }else{
            if(ServoStart >= servoPosition - interval){
                setServo(ServoStart);
                Serial.println("L");
                direction = true;
            }else{
                setServo(servoPosition - interval);
            }
        }

    }
}

void setServo(uint8_t position){
    servoPosition = position;
    motor.write(position);
}

float getDistance(){
    digitalWrite(US_TRIG, HIGH);
    delay(delayRate);
    digitalWrite(US_TRIG, LOW);

    float time = pulseIn(US_ECHO, HIGH);
    float distance = time/29/2;

    return distance;
}