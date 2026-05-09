import 'package:flutter/material.dart';
import '../models/idea.dart';
import 'score_badge.dart';
import 'category_badge.dart';

class IdeaCard extends StatelessWidget {
  final Idea idea;
  final String? score;
  final String? category;
  final String? preview;

  const IdeaCard({
    super.key,
    required this.idea,
    this.score,
    this.category,
    this.preview,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  idea.authorName,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                if (idea.status == 'processing')
                  const SizedBox(
                    height: 16,
                    width: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            if (preview != null)
              Text(
                preview!,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(color: Colors.grey.shade600),
              ),
            const SizedBox(height: 8),
            Row(
              children: [
                if (category != null) CategoryBadge(category: category),
                const SizedBox(width: 8),
                if (score != null) ScoreBadge(score: score),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              idea.createdAt.toLocal().toString(),
              style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
            ),
          ],
        ),
      ),
    );
  }
}
