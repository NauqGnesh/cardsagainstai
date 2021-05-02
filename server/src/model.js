var torchjs = require('@arition/torch-js');
// model_path = './resources/models/April17Model.pt'
// model_path = './resources/models/simple_script_cpu_2021-04-18_09-45.pt' //simple_script_2021-04-18_09-18.pt'
// model_path = './resources/models/traced_distilbert.pt'
// model_path = './resources/models/traced_mobilebert (1).pt'
model_path = './resources/models/traced_mobilebert_net_wrapper.pt'

const fs = require('fs')
fs.stat(model_path, (err, stats) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(stats)
  //we have access to the file stats in `stats`
})
var script_module = new torchjs.ScriptModule(model_path);

async function score(texts) {
    var tensor = torchjs.rand(1, 768);
    // var randoms = [...Array(768)].map(() => Math.floor(Math.random() * 9));

    let output = await script_module.forward(tensor)
    score = output.toObject()['data'][0]
    console.log(score);
    return score
}

async function run_through_distilBert() {
  var tensor = torchjs.rand(1, 5);
  // The BertModel expectes LongTensor https://huggingface.co/transformers/model_doc/bert.html#transformers.BertModel.forward 
  let output = await script_module.forward(torchjs.tensor([[0, 0, 0, 0, 0]], {dtype: torchjs.int32}), torchjs.tensor([[0, 0, 0, 0, 0]], {dtype: torchjs.int32}))
  // let output = await script_module.forward(torchjs.tensor([[0, 0, 0, 0, 0]], {
  //   dtype: torchjs.Long,
  // }), torchjs.tensor([[0, 0, 0, 0, 0]], {
  //   dtype: torchjs.long,
  // }))
  embedding = output.toObject()['data'][0]
  console.log(embedding)
  return embedding
}


const tokenizers = require('tokenizers')
// import {BertWordPieceTokenizer} from "tokenizers";
async function tokenize(text) {
  // Got vocab file from https://github.com/microsoft/SDNet/blob/master/bert_vocab_files/bert-base-uncased-vocab.txt
  const wordPieceTokenizer = await tokenizers.BertWordPieceTokenizer.fromOptions({ vocabFile: "./resources/models/bert-base-uncased-vocab.txt" });
  const wpEncoded = await wordPieceTokenizer.encode(text);
  
  console.log(wpEncoded.length);
  console.log(typeof wpEncoded.tokens);
  console.log(wpEncoded.ids);
  console.log(wpEncoded.attentionMask);
  console.log(wpEncoded.offsets);
  console.log(wpEncoded.overflowing);
  console.log(wpEncoded.specialTokensMask);
  console.log(wpEncoded.typeIds);
  console.log(wpEncoded.wordIndexes);
  return wpEncoded.ids
}

async function get_mobile_bert_embs(text) {
  var tokens_array = await tokenize(text)
  console.log("tokens_array\n", tokens_array)
  var bert_tokens_tensor = torchjs.tensor([tokens_array])
  console.log(bert_tokens_tensor.toObject())
  let output = await script_module.forward(bert_tokens_tensor)
  // let output = await script_module.forward(torchjs.tensor([[0, 0, 0, 0, 0]], {
  //   dtype: torchjs.Long,
  // }), torchjs.tensor([[0, 0, 0, 0, 0]], {
  //   dtype: torchjs.long,
  // }))
  // console.log(output[0].toObject(), output[1])
  embedding = output[0].toObject()['data']
  console.log(embedding)
  return embedding
}

module.exports = {
    score,
    run_through_distilBert,
    tokenize,
    get_mobile_bert_embs
};  