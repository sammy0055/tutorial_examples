import { OpenAIEmbeddings } from "@langchain/openai";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import {
  RecursiveCharacterTextSplitter,
  CharacterTextSplitter,
} from "langchain/text_splitter";

import { Chroma } from "@langchain/community/vectorstores/chroma";
import np from "numjs";

const loadcsv = new CSVLoader("src/docs/text.csv");
const loadPdf = new PDFLoader("src/docs/amzon_s3.pdf", {
  splitPages: false,
});

const chunkSize = 1000;
const chunkOverlap = 150;
const persistant_dir = "src/docs/croma";

const recursive_spliter = new RecursiveCharacterTextSplitter({
  chunkSize,
  chunkOverlap,
});

const character_spliter = new CharacterTextSplitter({
  chunkSize,
  chunkOverlap,
  separator: "\n",
});

const text = "in the beginning God created the heavens and the earth";
const text2 = `Hi.\n\nI'm Harrison.\n\nHow? Are? You?\nOkay then f f f f.
This is a weird text to write, but gotta test the splittingggg some how.\n\n
Bye!\n\n-H.`;

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-large",
  dimensions: 10,
});

const vectorStore = new Chroma(embeddings, {
  collectionName: "s3_intro",
});

const sent1 = "i like dogs";
const sent2 = "i like canines";
const sent3 = "the weather is ugly outside";

const addDocumentsToStore = async () => {
  try {
    const docs = await loadPdf.load();
    const splited = await recursive_spliter.splitDocuments(docs);
    await vectorStore.addDocuments(splited);
  } catch (error: any) {
    console.log("error-server: ", error);
  }
};

function called() {
  return [];
}
export const loaderFn = async () => {
  try {
    const res = await vectorStore.maxMarginalRelevanceSearch(
      `when they wander and dazed into the center, he laughs and
        laughs at them-so hard, that he laughs them to death!`,
      { k: 2, fetchK: 3, lambda: 0 },
      called()
    );
    console.log(res);
  } catch (error: any) {
    console.log("error-server: ", error);
  }
};

export const pdfLoader = async () => {
  const vectorStore = await Chroma.fromTexts(
    [
      `Tortoise: Labyrinth? Labyrinth? Could it Are we in the notorious Little
              Harmonic Labyrinth of the dreaded Majotaur?`,
      "Achilles: Yiikes! What is that?",
      `Tortoise: They say-although I person never believed it myself-that an I
              Majotaur has created a tiny labyrinth sits in a pit in the middle of
              it, waiting innocent victims to get lost in its fears complexity.
              Then, when they wander and dazed into the center, he laughs and
              laughs at them-so hard, that he laughs them to death!`,
      "Achilles: Oh, no!",
      "Tortoise: But it's only a myth. Courage, Achilles.",
    ],
    [{ id: 2 }, { id: 1 }, { id: 3 }],
    new OpenAIEmbeddings(),
    {
      collectionName: "godel-escher-bach",
    }
  );

  const response = await vectorStore.similaritySearch("scared", 1);

  console.log(response);
};
