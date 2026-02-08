
import { ReactNode } from 'react';

export type ReportType = 'type1' | 'type2' | 'type3' | 'type4';

export interface SubCategory {
  id: string;
  label: string;
  icon: ReactNode;
  color: string;
}

export interface ReportData {
  title: string;
  redTitle: string;
  description: string;
  image1: string | null;
  image2: string | null;
  candidateImage1: string | null;
  candidateImage2: string | null;
  date: string;
  person1Name: string;
  person1Title: string;
  person1Quote: string;
  person2Name: string;
  person2Title: string;
  person2Quote: string;
  authorName: string;
  subText: string;
  source: string;
  party1Seats: string;
  party1MarkerName: string;
  party2Seats: string;
  party2MarkerName: string;
  candidateName1: string;
  candidateName2: string;
  winnerMarkerName: string;
}
