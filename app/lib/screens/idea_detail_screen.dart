import 'package:flutter/material.dart';

class IdeaDetailScreen extends StatelessWidget {
  final String ideaId;

  const IdeaDetailScreen({super.key, required this.ideaId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Idea Detail')),
      body: Center(child: Text('Idea: $ideaId')),
    );
  }
}
