import 'package:flutter/material.dart';
import '../utils/colors.dart';

class ScoreBadge extends StatelessWidget {
  final String? score;

  const ScoreBadge({super.key, this.score});

  @override
  Widget build(BuildContext context) {
    return Chip(
      backgroundColor: AppColors.scoreColor(score),
      label: Text(
        score ?? 'Unknown',
        style: const TextStyle(color: Colors.white),
      ),
    );
  }
}
