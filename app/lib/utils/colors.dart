import 'package:flutter/material.dart';

class AppColors {
  static const Color scoreGood = Color(0xFF4CAF50);
  static const Color scoreWeak = Color(0xFFFFA726);
  static const Color scorePivot = Color(0xFFEF5350);
  static const Color scoreUnknown = Color(0xFF9E9E9E);

  static const Color connOnline = Color(0xFF4CAF50);
  static const Color connPending = Color(0xFFFFA726);
  static const Color connError = Color(0xFFEF5350);

  static Color scoreColor(String? score) {
    switch (score) {
      case 'Good Idea':
        return scoreGood;
      case 'Weak':
        return scoreWeak;
      case 'Needs Pivot':
        return scorePivot;
      default:
        return scoreUnknown;
    }
  }
}
