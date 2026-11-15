export type Continent =
  | 'Africa'
  | 'Asia'
  | 'Europe'
  | 'North America'
  | 'South America'
  | 'Oceania';

export interface Country {
  name: string;
  capital: string;
  flag: string;
  continent: Continent;
}

export const COUNTRIES: Country[] = [
  // Africa
  { name: 'Nigeria', capital: 'Abuja', flag: '🇳🇬', continent: 'Africa' },
  { name: 'Egypt', capital: 'Cairo', flag: '🇪🇬', continent: 'Africa' },
  { name: 'South Africa', capital: 'Pretoria', flag: '🇿🇦', continent: 'Africa' },
  { name: 'Kenya', capital: 'Nairobi', flag: '🇰🇪', continent: 'Africa' },
  { name: 'Ethiopia', capital: 'Addis Ababa', flag: '🇪🇹', continent: 'Africa' },
  { name: 'Morocco', capital: 'Rabat', flag: '🇲🇦', continent: 'Africa' },
  { name: 'Ghana', capital: 'Accra', flag: '🇬🇭', continent: 'Africa' },
  { name: 'Tanzania', capital: 'Dodoma', flag: '🇹🇿', continent: 'Africa' },
  { name: 'Algeria', capital: 'Algiers', flag: '🇩🇿', continent: 'Africa' },
  { name: 'Senegal', capital: 'Dakar', flag: '🇸🇳', continent: 'Africa' },
  { name: 'Tunisia', capital: 'Tunis', flag: '🇹🇳', continent: 'Africa' },
  { name: 'Uganda', capital: 'Kampala', flag: '🇺🇬', continent: 'Africa' },
  // Asia
  { name: 'China', capital: 'Beijing', flag: '🇨🇳', continent: 'Asia' },
  { name: 'Japan', capital: 'Tokyo', flag: '🇯🇵', continent: 'Asia' },
  { name: 'India', capital: 'New Delhi', flag: '🇮🇳', continent: 'Asia' },
  { name: 'South Korea', capital: 'Seoul', flag: '🇰🇷', continent: 'Asia' },
  { name: 'Thailand', capital: 'Bangkok', flag: '🇹🇭', continent: 'Asia' },
  { name: 'Indonesia', capital: 'Jakarta', flag: '🇮🇩', continent: 'Asia' },
  { name: 'Vietnam', capital: 'Hanoi', flag: '🇻🇳', continent: 'Asia' },
  { name: 'Philippines', capital: 'Manila', flag: '🇵🇭', continent: 'Asia' },
  { name: 'Malaysia', capital: 'Kuala Lumpur', flag: '🇲🇾', continent: 'Asia' },
  { name: 'Pakistan', capital: 'Islamabad', flag: '🇵🇰', continent: 'Asia' },
  { name: 'Bangladesh', capital: 'Dhaka', flag: '🇧🇩', continent: 'Asia' },
  { name: 'Turkey', capital: 'Ankara', flag: '🇹🇷', continent: 'Asia' },
  { name: 'Saudi Arabia', capital: 'Riyadh', flag: '🇸🇦', continent: 'Asia' },
  { name: 'Iran', capital: 'Tehran', flag: '🇮🇷', continent: 'Asia' },
  { name: 'Iraq', capital: 'Baghdad', flag: '🇮🇶', continent: 'Asia' },
  { name: 'Israel', capital: 'Jerusalem', flag: '🇮🇱', continent: 'Asia' },
  { name: 'Singapore', capital: 'Singapore', flag: '🇸🇬', continent: 'Asia' },
  { name: 'Sri Lanka', capital: 'Colombo', flag: '🇱🇰', continent: 'Asia' },
  { name: 'Kazakhstan', capital: 'Astana', flag: '🇰🇿', continent: 'Asia' },
  { name: 'Afghanistan', capital: 'Kabul', flag: '🇦🇫', continent: 'Asia' },
  // Europe
  { name: 'France', capital: 'Paris', flag: '🇫🇷', continent: 'Europe' },
  { name: 'Germany', capital: 'Berlin', flag: '🇩🇪', continent: 'Europe' },
  { name: 'Spain', capital: 'Madrid', flag: '🇪🇸', continent: 'Europe' },
  { name: 'Portugal', capital: 'Lisbon', flag: '🇵🇹', continent: 'Europe' },
  { name: 'Italy', capital: 'Rome', flag: '🇮🇹', continent: 'Europe' },
  { name: 'United Kingdom', capital: 'London', flag: '🇬🇧', continent: 'Europe' },
  { name: 'Ireland', capital: 'Dublin', flag: '🇮🇪', continent: 'Europe' },
  { name: 'Netherlands', capital: 'Amsterdam', flag: '🇳🇱', continent: 'Europe' },
  { name: 'Belgium', capital: 'Brussels', flag: '🇧🇪', continent: 'Europe' },
  { name: 'Switzerland', capital: 'Bern', flag: '🇨🇭', continent: 'Europe' },
  { name: 'Austria', capital: 'Vienna', flag: '🇦🇹', continent: 'Europe' },
  { name: 'Poland', capital: 'Warsaw', flag: '🇵🇱', continent: 'Europe' },
  { name: 'Czechia', capital: 'Prague', flag: '🇨🇿', continent: 'Europe' },
  { name: 'Sweden', capital: 'Stockholm', flag: '🇸🇪', continent: 'Europe' },
  { name: 'Norway', capital: 'Oslo', flag: '🇳🇴', continent: 'Europe' },
  { name: 'Finland', capital: 'Helsinki', flag: '🇫🇮', continent: 'Europe' },
  { name: 'Denmark', capital: 'Copenhagen', flag: '🇩🇰', continent: 'Europe' },
  { name: 'Greece', capital: 'Athens', flag: '🇬🇷', continent: 'Europe' },
  { name: 'Ukraine', capital: 'Kyiv', flag: '🇺🇦', continent: 'Europe' },
  { name: 'Russia', capital: 'Moscow', flag: '🇷🇺', continent: 'Europe' },
  { name: 'Romania', capital: 'Bucharest', flag: '🇷🇴', continent: 'Europe' },
  { name: 'Hungary', capital: 'Budapest', flag: '🇭🇺', continent: 'Europe' },
  // North America
  { name: 'United States', capital: 'Washington, D.C.', flag: '🇺🇸', continent: 'North America' },
  { name: 'Canada', capital: 'Ottawa', flag: '🇨🇦', continent: 'North America' },
  { name: 'Mexico', capital: 'Mexico City', flag: '🇲🇽', continent: 'North America' },
  { name: 'Cuba', capital: 'Havana', flag: '🇨🇺', continent: 'North America' },
  { name: 'Jamaica', capital: 'Kingston', flag: '🇯🇲', continent: 'North America' },
  { name: 'Guatemala', capital: 'Guatemala City', flag: '🇬🇹', continent: 'North America' },
  { name: 'Panama', capital: 'Panama City', flag: '🇵🇦', continent: 'North America' },
  // South America
  { name: 'Brazil', capital: 'Brasília', flag: '🇧🇷', continent: 'South America' },
  { name: 'Argentina', capital: 'Buenos Aires', flag: '🇦🇷', continent: 'South America' },
  { name: 'Chile', capital: 'Santiago', flag: '🇨🇱', continent: 'South America' },
  { name: 'Peru', capital: 'Lima', flag: '🇵🇪', continent: 'South America' },
  { name: 'Colombia', capital: 'Bogotá', flag: '🇨🇴', continent: 'South America' },
  { name: 'Venezuela', capital: 'Caracas', flag: '🇻🇪', continent: 'South America' },
  { name: 'Ecuador', capital: 'Quito', flag: '🇪🇨', continent: 'South America' },
  // Oceania
  { name: 'Australia', capital: 'Canberra', flag: '🇦🇺', continent: 'Oceania' },
  { name: 'New Zealand', capital: 'Wellington', flag: '🇳🇿', continent: 'Oceania' },
  { name: 'Fiji', capital: 'Suva', flag: '🇫🇯', continent: 'Oceania' },
];