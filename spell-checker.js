#!/usr/bin/env node

var fs = require('fs'),
    colors = require('colors');

// Validando a qtd de argumentos.
if (process.argv.length < 3) {
    console.log('-----------------------------------------');
    console.log('Uso: spell-checker config_file.js');
    console.log('-----------------------------------------');
    console.log('\nconfig_file.js -> Arquivo de configuração que contém os parsers e diretórios que serão escaneados e validados.');
    console.log('\n');
    return 1;
}

var configFileName = process.argv[2];

// Verificando o arquivo de configuracao fornecido.
if (!fs.existsSync(configFileName) || !fs.statSync(configFileName).isFile()) {
    console.log('Erro: '.red + 'O arquivo \'' + configFileName + '\' não existe!');
    return 1;
}

var config = require(configFileName);

/**
 * Realiza a validacao de ortografia para o arquivo de nome fornecido.
 * 
 * @param fileName Nome do arquivo.
 * @param callback Funcao de callback responsavel por processar a resposta.
 */
function checkSpellOfFile(fileName, callback) {
    for (var ext in config.parsers) {
        if (fileName.match(new RegExp("\\." + ext + "$", "i"))) {
            
            //console.log('Validando ' + fileName);
            
            fs.readFile(fileName, function(err, data) {
                callback(err, config.parsers[ext](data), fileName);
            });
            
            break;
        }
    }    
}

/**
 * Realiza a validacao de ortografia dos arquivos contidos no diretorio fornecido.
 *
 * @param dir Diretorio a ser validado.
 * @param callback Funcao de callback responsavel por processar a resposta.
 */ 
function checkSpellOfDir(dir, callback) {
    //console.log('Lendo dir: ', dir);
    
    var stat = fs.statSync(dir);
    
    if (stat.isDirectory()) {
        
        fs.readdir(dir, function(err, files) {
            files.forEach(function(fileOrDir) {
                if (!fileOrDir.match(/^\./)) {
                    checkSpellOfDir(dir + '/' + fileOrDir, callback);
                }                
            });
        });        
        
    } else {
        checkSpellOfFile(dir, callback);
    }
}

// Dicionario
var dict = require(config.dictionary);

// Removendo duplicados.
dict = dict.filter(function(elem, pos, self) {
    return self.indexOf(elem) == pos;
});

// Erros
var filesErrors = {};

console.log('Total de palavaras no dicionário: ' + (dict.length > 0 ? ('' + dict.length).green : ('' + dict.length).red));

config.dirs.forEach(function(dir, i) {
    
    checkSpellOfDir(dir, function(err, tokens, fileName) {        
        var errors = 0;
        var outOfDict = [];
        
        // Validando cada token do arquivo.
        tokens.forEach(function(token) {
            var err = true;
            
            // Verifica se o token esta presente no dicionario.
            dict.forEach(function(dictRule) {
                var flag = 'i';
                
                if (dictRule.charAt(0) == '*') {
                    dictRule = dictRule.substr(1);
                    flag = '';
                }
                
                // A palavra (regex) do dicionardo casa com o token do arquivo?
                if (token.match(new RegExp('^' + dictRule + '$', flag))) {
                    // Sim, entao o token eh valido!
                    err = false;
                    return false;
                }       
            });
            
            if (err) {            
                errors++;
                outOfDict.push(token);
            }
        });
                
        if (errors == 0) {
            //console.log('       ' + 'OK'.blue + '       : ' + fileName);
        } else {
            
            filesErrors[fileName] = outOfDict;
            
            console.log(' OK ' + ((tokens.length - errors) + '').green + ' | Falha ' + ('' + errors).red + ' : ' + fileName);
        }
    });
});

process.on('exit', function() {
    console.log('\n\n==== ERROS ====\n'.red);
    
    for (var fileName in filesErrors) {
        console.log(fileName + ': \n', filesErrors[fileName], '\n');
    }
});

