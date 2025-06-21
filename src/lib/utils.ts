import { format, parseISO, isAfter, isBefore } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';

// Utility function to combine classNames (similar to classnames library)
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Date formatting utilities
export function formatMatchDate(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'dd/MM/yyyy HH:mm');
}

export function formatMatchDateSpanish(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, "dd 'de' MMMM, HH:mm");
}

export function isMatchUpcoming(dateString: string): boolean {
  const matchDate = parseISO(dateString);
  return isAfter(matchDate, new Date());
}

export function isMatchLive(dateString: string): boolean {
  const matchDate = parseISO(dateString);
  const now = new Date();
  const matchEnd = new Date(matchDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours after kick-off
  return isAfter(now, matchDate) && isBefore(now, matchEnd);
}

// Prize pool calculations for La Porra de Fran
export function calculatePrizeDistribution(totalPool: number, penaSplit: number = 0.5) {
  const penaShare = totalPool * penaSplit;
  const prizesShare = totalPool * (1 - penaSplit);
  
  return {
    penaShare: Math.round(penaShare * 100) / 100,
    prizesShare: Math.round(prizesShare * 100) / 100,
    winnerPrize: Math.round(prizesShare * 0.7 * 100) / 100, // 70% to winner
    runnerUpPrize: Math.round(prizesShare * 0.3 * 100) / 100, // 30% to runner-up
  };
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPrediction(prediction: string): boolean {
  const predictionRegex = /^\d{1,2}-\d{1,2}$/;
  return predictionRegex.test(prediction);
}

// Social media utilities
export function getFacebookGroupUrl(): string {
  return 'https://www.facebook.com/groups/beticosenescocia/';
}

export function getInstagramUrl(): string {
  return 'https://www.instagram.com/rbetisescocia/';
}

// Constants
export const POLWARTH_TAVERN = {
  name: 'Polwarth Tavern',
  address: '15 Polwarth Pl, Edinburgh EH11 1NH',
  phone: '+44 131 229 3402',
  googleMapsUrl: 'https://maps.google.com/maps?q=Polwarth+Tavern+Edinburgh',
};

export const BETIS_COLORS = {
  green: '#00A651',
  white: '#FFFFFF',
  gold: '#FFD700',
  dark: '#1a1a1a',
};
