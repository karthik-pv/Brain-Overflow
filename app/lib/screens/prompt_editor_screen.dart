import 'package:flutter/material.dart';

class PromptEditorScreen extends StatelessWidget {
  const PromptEditorScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Prompts')),
      body: const Center(child: Text('Prompt Editor')),
    );
  }
}
