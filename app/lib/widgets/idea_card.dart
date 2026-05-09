import 'package:flutter/material.dart';
import '../models/idea.dart';

class IdeaCard extends StatelessWidget {
  final Idea idea;

  const IdeaCard({super.key, required this.idea});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: Text(idea.authorName),
        subtitle: Text(idea.status),
        trailing: Text(idea.createdAt.toString()),
      ),
    );
  }
}
