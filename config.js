module.exports = {
    dirs: [
        '/dados/Workspace/Java/erp',
        '/dados/Workspace/Java/portal',
        '/dados/Workspace/Java/sac',
        '/dados/Workspace/Java/administrativo'
    ],
        
    dictionary: '/home/tarcisio/Estudo/Nodejs/spell-checker/dictionary.json',

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
