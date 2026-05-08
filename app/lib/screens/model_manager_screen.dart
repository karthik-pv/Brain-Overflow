import 'package:flutter/material.dart';

class ModelManagerScreen extends StatelessWidget {
  const ModelManagerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AI Models')),
      body: const Center(child: Text('Model Manager')),
    );
  }
}
