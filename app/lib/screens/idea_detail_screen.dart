import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/chat_messages_provider.dart';
import '../providers/idea_detail_provider.dart';
import '../widgets/chat_bubble.dart';
import '../widgets/typing_indicator.dart';
import '../widgets/score_badge.dart';
import '../widgets/category_badge.dart';

class IdeaDetailScreen extends ConsumerStatefulWidget {
  final String ideaId;

  const IdeaDetailScreen({super.key, required this.ideaId});

  @override
  ConsumerState<IdeaDetailScreen> createState() => _IdeaDetailScreenState();
}

class _IdeaDetailScreenState extends ConsumerState<IdeaDetailScreen> {
  final _scrollController = ScrollController();
  bool _headerExpanded = true;

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final messagesAsync = ref.watch(chatMessagesProvider(widget.ideaId));
    final metadataAsync = ref.watch(ideaMetadataProvider(widget.ideaId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Idea Detail'),
        actions: [
          IconButton(
            icon: Icon(_headerExpanded ? Icons.expand_less : Icons.expand_more),
            onPressed: () => setState(() => _headerExpanded = !_headerExpanded),
          ),
        ],
      ),
      body: Column(
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            height: _headerExpanded ? null : 0,
            child: metadataAsync.when(
              data: (metadata) {
                if (metadata == null) return const SizedBox.shrink();
                return Container(
                  padding: const EdgeInsets.all(16),
                  color: Colors.grey.shade100,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          CategoryBadge(category: metadata.category),
                          const SizedBox(width: 8),
                          ScoreBadge(score: metadata.score),
                        ],
                      ),
                      if (metadata.refinedIdea != null) ...[
                        const SizedBox(height: 8),
                        Text(
                          metadata.refinedIdea!,
                          style: const TextStyle(fontWeight: FontWeight.w500),
                        ),
                      ],
                      if (metadata.targetPersona != null) ...[
                        const SizedBox(height: 4),
                        Text(
                          'Target: ${metadata.targetPersona}',
                          style: TextStyle(
                            color: Colors.grey.shade600,
                            fontSize: 12,
                          ),
                        ),
                      ],
                      if (metadata.keyFeatures.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 4,
                          children: metadata.keyFeatures
                              .map((f) => Chip(
                                    label: Text(f),
                                    padding: EdgeInsets.zero,
                                    materialTapTargetSize:
                                        MaterialTapTargetSize.shrinkWrap,
                                  ))
                              .toList(),
                        ),
                      ],
                    ],
                  ),
                );
              },
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
            ),
          ),
          Expanded(
            child: messagesAsync.when(
              data: (messages) {
                WidgetsBinding.instance
                    .addPostFrameCallback((_) => _scrollToBottom());
                return ListView.builder(
                  controller: _scrollController,
                  itemCount: messages.length,
                  itemBuilder: (context, index) {
                    return ChatBubble(message: messages[index]);
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, stack) => Center(child: Text('Error: $err')),
            ),
          ),
          const TypingIndicator(),
        ],
      ),
    );
  }
}
