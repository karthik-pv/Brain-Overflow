import 'package:flutter/material.dart';

class PromptBadge extends StatelessWidget {
  final String promptId;

  const PromptBadge({super.key, required this.promptId});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 4),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: Colors.blue.shade100,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        promptId,
        style: TextStyle(
          fontSize: 10,
          color: Colors.blue.shade800,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}
