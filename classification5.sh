DATADIR=`pwd`
MODELDIR=`pwd`

~/projects/StarSpace/starspace train \
  -trainFile "${DATADIR}"/train.txt \
  -model "${MODELDIR}"/model \
  -initRandSd 0.01 \
  -adagrad false \
  -ngrams 1 \
  -lr 0.01 \
  -epoch 5 \
  -thread 20 \
  -dim 50 \
  -negSearchLimit 10 \
  -maxNegSamples 50 \
  -trainMode 0 \
  -label "__label__" \
  -similarity "dot" \
  -verbose true

echo "Start to evaluate trained model:"

~/projects/StarSpace/starspace test \
  -model "${MODELDIR}"/model \
  -testFile "${DATADIR}"/test.txt \
  -ngrams 1 \
  -dim 50 \
  -label "__label__" \
  -thread 10 \
  -similarity "dot" \
  -trainMode 0 \
  -verbose true

