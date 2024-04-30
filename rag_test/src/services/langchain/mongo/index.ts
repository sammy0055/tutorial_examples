// import "dotenv/config";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { MongoClient } from "mongodb";
import { ChatOpenAI, OpenAI, OpenAIEmbeddings } from "@langchain/openai";
import {
  RetrievalQAChain,
  loadQAMapReduceChain,
  loadQAStuffChain,
  ConversationalRetrievalQAChain,
} from "langchain/chains";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ContextualCompressionRetriever } from "langchain/retrievers/contextual_compression";
import { LLMChainExtractor } from "langchain/retrievers/document_compressors/chain_extract";
import { PromptTemplate } from "@langchain/core/prompts";
const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-large",
  dimensions: 1024,
});

const chunkSize = 1000;
const chunkOverlap = 150;
const recursive_spliter = new RecursiveCharacterTextSplitter({
  chunkSize,
  chunkOverlap,
});

const loadPdf = new PDFLoader("src/docs/amzon_s3.pdf");
const client = new MongoClient(process.env.MONGODB_ATLAS_URI || "");
const namespace = "vectorDB.test";
const [dbName, collectionName] = namespace.split(".");
const collection = client.db(dbName).collection(collectionName);

const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
  collection,
  indexName: "default", // The name of the Atlas search index. Defaults to "default"
  textKey: "text", // The name of the collection field containing the raw content. Defaults to "text"
  embeddingKey: "embedding", // The name of the collection field containing the embedded text. Defaults to "embedding"
});

const model = new OpenAI({
  model: "gpt-3.5-turbo-instruct",
});

const chatModel = new ChatOpenAI({
  temperature: 0,
  model: "gpt-3.5-turbo-1106",
});
const baseCompressor = LLMChainExtractor.fromLLM(model);
const retriever = new ContextualCompressionRetriever({
  baseCompressor,
  baseRetriever: vectorStore.asRetriever({
    searchType: "mmr",
  }),
});

export const addDocumentsToStore = async () => {
  try {
    const docs = await loadPdf.load();
    const splited = await recursive_spliter.splitDocuments(docs);
    const ids = await vectorStore.addDocuments(splited);
    console.log("docs", ids);
    await client.close();
  } catch (error: any) {
    console.log("error-server: ", error);
    await client.close();
  }
};

const queryText = `ok, tell me more about cloudfront distributions and edge locations`;
export const semanticSearch = async () => {
  try {
    // const resultOne = await vectorStore.maxMarginalRelevanceSearch(
    //     queryText,
    //   { k: 2, fetchK: 2 }
    // );

    const retriever = vectorStore.asRetriever({
      searchType: "mmr",
      searchKwargs: {
        fetchK: 1,
        lambda: 0,
      },
    });
    const retrieverOutput = await retriever.getRelevantDocuments(queryText);
    console.log(retrieverOutput);
    await client.close();
  } catch (error: any) {
    console.log("error-server: ", error);
    await client.close();
  }
};

export const compresedDocumentTest = async () => {
  try {
    const retrievedDocs = await retriever.getRelevantDocuments(queryText);

    console.log(retrievedDocs);
    await client.close();
  } catch (error: any) {
    console.log("error-server: ", error);
    await client.close();
  }
};

const prompt = PromptTemplate.fromTemplate(
  `use the following pieces of context to answer the question at the
{context}
Question:{question}
Helpful Answer:
`
);

export const chatWithDocuments = async () => {
  try {
    const chain = RetrievalQAChain.fromLLM(
      chatModel,
      vectorStore.asRetriever(),
      {
        returnSourceDocuments: true,
      }
    );
    // chain with custom prompt
    // const chain = new RetrievalQAChain({
    //   combineDocumentsChain: loadQAStuffChain(chatModel, { prompt }),
    //   retriever: vectorStore.asRetriever(),
    //   returnSourceDocuments: true,
    // });
    const res = await chain.invoke({
      query: queryText,
    });

    console.log(res);
    await client.close();
  } catch (error: any) {
    console.log("error-server: ", error);
    await client.close();
  }
};

export const chatWithDocumentsMapReduceMethod = async () => {
  try {
    const chain = new RetrievalQAChain({
      combineDocumentsChain: loadQAMapReduceChain(chatModel),
      retriever: vectorStore.asRetriever({
        searchType: "mmr",
        searchKwargs: {
          fetchK: 3,
          lambda: 0,
        },
      }),
      returnSourceDocuments: true,
    });
    const res = await chain.invoke({
      query: queryText,
    });

    console.log(res);
    await client.close();
  } catch (error: any) {
    console.log("error-server: ", error);
    await client.close();
  }
};

// add memory to chat with document
export const documentChatPlusMemory = async () => {
  try {
    const chain = ConversationalRetrievalQAChain.fromLLM(
      chatModel,
      vectorStore.asRetriever(),
      {
        returnSourceDocuments: true,
      }
    );

    const res = await chain.invoke({
      query: queryText,
    });
    console.log(res);
    await client.close();
  } catch (error: any) {
    console.log("error-server: ", error);
    await client.close();
  }
};
