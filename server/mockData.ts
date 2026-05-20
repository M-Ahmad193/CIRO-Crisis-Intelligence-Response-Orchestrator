import { Signal, SignalCategory } from "./types";
import { v4 as uuidv4 } from "uuid";

export class MockSignalGenerator {
  public static generateSocialMediaSignal(content: string, lat: number, lng: number): Signal {
    return {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      category: SignalCategory.SOCIAL_MEDIA,
      content,
      location: { lat, lng },
      confidence: 0.6 + Math.random() * 0.3,
      sourceReliability: 0.5 + Math.random() * 0.4
    };
  }

  public static generateWeatherSignal(content: string, lat: number, lng: number): Signal {
    return {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      category: SignalCategory.WEATHER,
      content,
      location: { lat, lng },
      confidence: 0.95,
      sourceReliability: 0.98
    };
  }

  public static generateIoTSignal(content: string, lat: number, lng: number): Signal {
    return {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      category: SignalCategory.IOT_SENSOR,
      content,
      location: { lat, lng },
      confidence: 0.9,
      sourceReliability: 1.0
    };
  }
}

export const SCENARIOS = [
  {
    name: "Scenario 1: Mall Road Flash Flood",
    signals: [
      {
        delay: 0,
        signal: () => MockSignalGenerator.generateSocialMediaSignal("Heavy rain in Lahore! Mall Road is completely flooded near PC Hotel. Traffic at standstill.", 31.5546, 74.3361)
      },
      {
        delay: 5000,
        signal: () => MockSignalGenerator.generateWeatherSignal("Monsoon Alert: Extreme precipitation moving towards Lahore Central. 80mm expected.", 31.5204, 74.3587)
      },
      {
        delay: 15000,
        signal: () => MockSignalGenerator.generateIoTSignal("Drainage Sensor D-24: Water overflow detected at Lawrence Road junction.", 31.5528, 74.3385)
      }
    ]
  },
  {
    name: "Scenario 2: Liberty Market Electrical Incident",
    signals: [
      {
        delay: 0,
        signal: () => MockSignalGenerator.generateSocialMediaSignal("Smoke seen near Liberty Market parking! Looks like a transformer burst.", 31.5085, 74.3482)
      },
      {
        delay: 20000,
        signal: () => MockSignalGenerator.generateIoTSignal("Power Grid L-Section 4: Sudden voltage drop. Transformer T-12 failed.", 31.5085, 74.3482)
      },
      {
        delay: 40000,
        signal: () => ({
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          category: SignalCategory.FIELD_REPORT,
          content: "Responders on site. Small fire contained. No general threat to market area.",
          location: { lat: 31.5085, lng: 74.3482 },
          confidence: 1.0,
          sourceReliability: 1.0
        })
      }
    ]
  }
];
