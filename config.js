// Arquivo exemplo de configuração.

module.exports = {
    // Diretorios que serao validados.
    dirs: [
        '/dados/Workspace/Java/erp',
        '/dados/Workspace/Java/portal',
        '/dados/Workspace/Java/sac',
        '/dados/Workspace/Java/administrativo'
    ],
    
    // Dicionario de palavras.
    dictionary: '/home/tarcisio/Estudo/Nodejs/spell-checker/dictionary.json',

    // Validadores por extensao dos arquivos.
    parsers: { 
        'php': function(content) {
            var regex = /(?:BusinessException\s*\(\s*")(.*?)("\))/gi,
                ret   = [],
                matches;
            
            while ((matches = regex.exec(content)) !== null) {
                var tokens = matches[1].match(/[a-zA-Zà-úÀ-Ú]{3,}/ig);
                
                ret = ret.concat(tokens);                
            }

            return ret;
        }
    }
};
