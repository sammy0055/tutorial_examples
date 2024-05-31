import { Bedrock } from "@langchain/community/llms/bedrock";

const model = new Bedrock({
  model: "amazon.titan-text-express-v1",
  region: "us-east-1",
  endpointUrl: "bedrock-runtime.us-east-1.amazonaws.com",
  credentials: {
    accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY!,
  },
});

export const testBedrock = async () => {
  try {
    const res = await model.invoke("write a blog about women", {
        stop:[]
    });
    console.log(res);
  } catch (error: any) {
    console.log("error-server: ", error);
  }
};

