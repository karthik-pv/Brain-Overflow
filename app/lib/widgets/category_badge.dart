import 'package:flutter/material.dart';

class CategoryBadge extends StatelessWidget {
  final String? category;

  const CategoryBadge({super.key, this.category});

  @override
  Widget build(BuildContext context) {
    if (category == null) return const SizedBox.shrink();
    return Chip(
      label: Text(category!),
    );
  }
}
