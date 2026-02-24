/**
 * Service initialization (Android)
 *
 * Uses @sudobility/di_rn for centralized initialization
 * and @sudobility/auth_lib for Firebase Auth.
 */

import {
  initializeRNApp,
  type FirebaseAnalyticsService,
} from '@sudobility/di_rn';
import { initializeFirebaseAuth } from '@sudobility/auth_lib';

let servicesInitialized = false;
let analyticsService: FirebaseAnalyticsService | null = null;

export async function initializeAllServices(): Promise<FirebaseAnalyticsService> {
  if (servicesInitialized && analyticsService) {
    return analyticsService;
  }

  analyticsService = await initializeRNApp();
  initializeFirebaseAuth();

  servicesInitialized = true;
  return analyticsService;
}

export function getAnalytics(): FirebaseAnalyticsService | null {
  return analyticsService;
}
