// Arquivo exemplo de configuração.

module.exports = {
    // Diretorios que serao validados.
    dirs: [
        '/dados/Workspace/Java/erp'//,
        //'/dados/Workspace/Java/portal',
        //'/dados/Workspace/Java/sac',
        //'/dados/Workspace/Java/administrativo'
    ],
    
    // Dicionario de palavras.
    dictionary: '/home/tarcisio/Estudo/Nodejs/spell-checker/dictionary.json',

    // Validadores por extensao dos arquivos.
    parsers: { 
        'php': function(content) {
            var regex = /(?:BusinessException\s*\(\s*)(".*?")(\))/gi,
                ret   = [],
                matches;                        
            
            while ((matches = regex.exec(content)) !== null) {
                var token = matches[1].match(/"(.*?)"/g).join(',');
                
                var tokens = token.match(/[a-zA-Zà-úÀ-Ú]{3,}/ig);
                
                ret = ret.concat(tokens);                
            }
            
            //process.exit(1);

            return ret;
        },
        
        'phtml': function(content) {
            // Conteudo dentro das tags <..> TEXTO </..>
            var regex = /<([\w]+)[^>]*>([^<^&.]*?)<\/\1>/ig,
                ret   = [],
                matches;                        
            
            while ((matches = regex.exec(content)) !== null) {
                var tokens = matches[2].match(/[a-zA-Zà-úÀ-Ú]{3,}/ig);
                
                if (tokens) {
                    ret = ret.concat(tokens);  
                }
            }        
            
            // Conteudo dentro das tags <..> TEXTO </..>
            regex = /data-desc\s*=\s*"(.*?)"/ig
            
            while ((matches = regex.exec(content)) !== null) {
                var tokens = matches[1].match(/[a-zA-Zà-úÀ-Ú]{3,}/ig);
                
                if (tokens) {
                    ret = ret.concat(tokens);  
                }
            }
            
            return ret;
        },
        
        'js': function(content) {
             var regex = /Utils\.(warn|info|error)?\s*\(\s*(["'])(.*?)\2/ig,
                ret   = [],
                matches;                        
            
            while ((matches = regex.exec(content)) !== null) {
                var tokens = matches[3].match(/[a-zA-Zà-úÀ-Ú]{3,}/ig);
                
                if (tokens) {
                    ret = ret.concat(tokens);  
                }              
            }

            return ret;
        }
    }
};
