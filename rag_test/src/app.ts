import "dotenv/config";
import { loaderFn, pdfLoader } from "./services/langchain";
import {
  addDocumentsToStore,
  chatWithDocuments,
  chatWithDocumentsMapReduceMethod,
  compresedDocumentTest,
  semanticSearch,
} from "./services/langchain/mongo";
import { testBedrock } from "./services/langchain/aws-bedrock";
console.log("welcome");
// loaderFn()
// pdfLoader()

// mongo vector operations
addDocumentsToStore()
// semanticSearch()
// compresedDocumentTest()
// chatWithDocuments()
// chatWithDocumentsMapReduceMethod();
// testBedrock()
