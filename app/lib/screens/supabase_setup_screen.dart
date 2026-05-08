import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hive/hive.dart';
import '../services/supabase_init_service.dart';

class SupabaseSetupScreen extends StatefulWidget {
  const SupabaseSetupScreen({super.key});

  @override
  State<SupabaseSetupScreen> createState() => _SupabaseSetupScreenState();
}

class _SupabaseSetupScreenState extends State<SupabaseSetupScreen> {
  final _urlController = TextEditingController();
  final _keyController = TextEditingController();
  bool _testing = false;

  @override
  void dispose() {
    _urlController.dispose();
    _keyController.dispose();
    super.dispose();
  }

  Future<void> _testConnection() async {
    setState(() => _testing = true);
    final url = _urlController.text.trim();
    final key = _keyController.text.trim();

    final success = await SupabaseInitService.testConnection(url, key);

    setState(() => _testing = false);

    if (success) {
      final box = Hive.box('credentials');
      await box.put('supabaseUrl', url);
      await box.put('supabaseAnonKey', key);
      await SupabaseInitService.initialize(url, key);
      if (mounted) context.go('/onboarding');
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Connection failed. Check URL and key.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Setup Supabase')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: _urlController,
              decoration: const InputDecoration(
                labelText: 'Supabase URL',
                hintText: 'https://your-project.supabase.co',
              ),
              keyboardType: TextInputType.url,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _keyController,
              decoration: const InputDecoration(
                labelText: 'Anon Key',
                hintText: 'eyJhbGciOiJIUzI1NiIs...',
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _testing ? null : _testConnection,
              child: _testing
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Test Connection'),
            ),
          ],
        ),
      ),
    );
  }
}
