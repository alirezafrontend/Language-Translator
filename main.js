const input_text = document.querySelector("#input_text");
const text_output = document.querySelector(".text_output");
const input_chars = document.querySelector("#input_chars");
const example = document.querySelector(".example");
const synonyms = document.querySelector(".synonyms");
const title_example = document.querySelector(".title_example");
const text_example = document.querySelector(".text_example");
const title_synonyms = document.querySelector(".title_synonyms");
const text_synonyms = document.querySelector(".text_synonyms");
const audio = document.querySelector(".audio");
const icon_sound = document.querySelector(".icon_sound");

let abortController; 

async function getTranslation(text) {
  try {
    if (text.trim() === "") {
      resetUI();
      return;
    }

    //
    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();

    //
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=fa&dt=t&dt=rm&dt=s&dt=ex&q=${encodeURIComponent(
      text
    )}`;
    const response = await fetch(url, { signal: abortController.signal });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    console.log("Google Translate API Response:", data);

    //
    if (input_text.value.trim() === "") {
      resetUI();
      return;
    }

    //
    text_output.textContent =
      data[0] && data[0][0] ? data[0][0][0] : "Translation not found";

    //
    input_chars.textContent = text.length;

    // 
    if (data[13] && data[13][0] && data[13][0][0]) {
      example.classList.remove("hidden");
      example.classList.add("flex");
      title_example.textContent = "Example";
      text_example.innerHTML = data[13][0][0][0];
    } else {
      example.classList.add("hidden");
      example.classList.remove("flex");
      title_example.textContent = "";
      text_example.textContent = "No example found.";
    }

    // 
    getSynonyms(text);

    //
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=gtx&q=${encodeURIComponent(
      text
    )}`;

    if (text.trim() !== "") {
      audio.src = audioUrl;
      icon_sound.classList.remove("hidden");
    } else {
      icon_sound.classList.add("hidden"); //
    }
  } catch (error) {
    if (error.name === "AbortError") {
      console.warn("Request aborted due to rapid input change.");
    } else {
      console.error("Error fetching translation:", error);
    }
    text_output.textContent = "";
  }
}

async function getSynonyms(word) {
  try {
    // 
    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();

    const url = `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(
      word
    )}`;
    const response = await fetch(url, { signal: abortController.signal });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    console.log("Datamuse API Response:", data);

    // 
    if (input_text.value.trim() === "") {
      resetUI();
      return;
    }

    if (data.length > 0) {
      synonyms.classList.remove("hidden");
      synonyms.classList.add("flex");
      title_synonyms.textContent = "Synonyms";
      text_synonyms.textContent = data
        .slice(0, 10)
        .map((s) => s.word)
        .join(", ");
    } else {
      synonyms.classList.add("hidden");
      synonyms.classList.remove("flex");
      title_synonyms.textContent = "";
      text_synonyms.textContent = "No synonyms found.";
    }
  } catch (error) {
    if (error.name === "AbortError") {
      console.warn("Synonyms request aborted due to rapid input change.");
    } else {
      console.error("Error fetching synonyms:", error);
    }
    synonyms.classList.add("hidden");
    title_synonyms.textContent = "";
    text_synonyms.textContent = "No synonyms found.";
  }
}

// 
function resetUI() {
  text_output.textContent = "";
  input_chars.textContent = "0";
  icon_sound.classList.add("hidden");

  // 
  example.classList.add("hidden");
  example.classList.remove("flex");
  title_example.textContent = "";
  text_example.textContent = "";

  // 
  synonyms.classList.add("hidden");
  synonyms.classList.remove("flex");
  title_synonyms.textContent = "";
  text_synonyms.textContent = "";
}

input_text.addEventListener("input", () => getTranslation(input_text.value));

icon_sound.addEventListener("click", () => {
  if (audio.src) {
    audio.play().catch((error) => console.warn("Audio play error:", error));
  } else {
    console.warn("No audio source available!");
  }
});
