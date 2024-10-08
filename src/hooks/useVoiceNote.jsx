import { useEffect, useRef, useState } from "react";
import { useToast } from "./use-toast";
import useWindowWidth from "./useWindowWidth";

function punctuationReplacement(language, transcript) {
  if (language === "en-GB") {
    const formattedTranscript = transcript
      .replaceAll("punctuation comma", ", ")
      .replaceAll("punctuation period", ". ")
      .replaceAll("punctuation semicolon", "; ")
      .replaceAll("punctuation dash", "- ")
      .replaceAll("punctuation underscore", "_")
      .replaceAll("punctuation quotation mark", '"')
      .replaceAll("punctuation colon", ": ")
      .replaceAll("punctuation apostrophe", "'")
      .replaceAll("punctuation exclamation point", "! ")
      .replaceAll("punctuation question mark", "? ")
      .replaceAll("punctuation opening paranthenses", "(")
      .replaceAll("punctuation closing paranthenses", ")")
      .replaceAll("punctuation opening bracket", "{")
      .replaceAll("punctuation closing bracket", "}");

    return formattedTranscript;
  } else if (language === "zh-CN") {
    const formattedTranscript = transcript
      .replaceAll("逗号", "，")
      .replaceAll("句号", "。")
      .replaceAll("分号", "；")
      .replaceAll("破折号", "- ")
      .replaceAll("引号", "‘")
      .replaceAll("冒号", "：")
      .replaceAll("感叹号", "！")
      .replaceAll("问号", "？")
      .replaceAll("开括号", "（")
      .replaceAll("关括号", "）")
      .replaceAll("顿号", "、");

    return formattedTranscript;
  }
}

function useVoiceNote(language) {
  const [isRecording, setIsRecording] = useState(false);
  const [doneRecording, setDoneRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimScript, setInterimScript] = useState("");
  const recognitionRef = useRef(null);

  const { toast } = useToast();
  const isMobile = useWindowWidth(1280);

  // console.log(transcript, interimScript);

  useEffect(() => {
    // Setup SpeechRecognition
    recognitionRef.current = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognitionRef.current.interimResults = true;
    // Somehow continuous makes every results .final is true
    recognitionRef.current.continuous = isMobile ? false : true;
    recognitionRef.current.lang = language;

    recognitionRef.current.onresult = (event) => {
      // console.log(event.results);
      let interimScript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        // Somehow for Chinese language, there's empty transcript being returned
        if (transcript.length === 0) {
          break;
        }

        if (event.results[i].isFinal) {
          setTranscript((prevTranscript) => {
            return punctuationReplacement(
              language,
              `${prevTranscript} ${transcript}`,
            );
          });
          setInterimScript("");
        } else {
          interimScript += transcript;
          setInterimScript(punctuationReplacement(language, interimScript));
        }
      }
    };

    return () => {
      // console.log("Cleanup");
      // Cleanup on component unmount
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.onresult = null;
      }
    };
  }, [language, toast, isMobile]);

  const startRecording = () => {
    if (!recognitionRef.current) {
      toast({ title: "Error", description: "Audio initialization failed." });
      return;
    }

    recognitionRef.current.start();

    setIsRecording(true);
  };

  const pauseRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setIsRecording(false);
  };

  const stopRecording = () => {
    if (!transcript) {
      return toast({
        title: "Start Recording",
        description: "No recording process can be stopped!",
      });
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setDoneRecording(true);

    recognitionRef.current.onresult = null;
  };

  return {
    isRecording,
    doneRecording,
    transcript,
    interimScript,
    startRecording,
    pauseRecording,
    stopRecording,
  };
}

export default useVoiceNote;
