import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Brain Overflow'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () => context.push('/settings'),
          ),
        ],
      ),
      body: const Center(
        child: Text('No ideas yet. Tap the mic to record one!'),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/record'),
        child: const Icon(Icons.mic),
      ),
    );
  }
}
