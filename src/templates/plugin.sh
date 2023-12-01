#!/usr/bin/env bash
${METADATA}
cd "${ROOT_PATH}"
${NODE_PATH} -e "import('${FILE_PATH}').then(({ default: plugin }) => new plugin().render()).catch((err) => console.error(err))"
