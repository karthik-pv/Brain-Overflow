import 'dart:async';
import 'package:permission_handler/permission_handler.dart';
import 'package:speech_to_text/speech_to_text.dart';

class SpeechService {
  final SpeechToText _speech = SpeechToText();
  StreamController<String>? _controller;

  Future<bool> init() async {
    await Permission.microphone.request();
    return _speech.initialize();
  }

  Stream<String> listen() {
    _controller = StreamController<String>();

    _speech.listen(
      onResult: (result) {
        if (!(_controller?.isClosed ?? true)) {
          _controller!.add(result.recognizedWords);
        }
      },
      listenFor: const Duration(minutes: 5),
      pauseFor: const Duration(seconds: 3),
      partialResults: true,
    );

    return _controller!.stream;
  }

  Future<void> stop() async {
    await _speech.stop();
    await _controller?.close();
    _controller = null;
  }
}
