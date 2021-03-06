#!/usr/bin/env node

var fs = require('fs'),
    colors = require('colors'),
    path = require('path');

var packInfo = require('./package');

var program = require('commander');

var msgDefault = "(esta opção ignora os valores informados no arquivo de configuração)";

program
    .version(packInfo.version)
    .usage('-c <file>')
    .option('-c, --config-file [file]'  , 'arquivo de configuração')
    .option('-p, --path [file]'         , 'arquivo ou diretório a ser validado ' + msgDefault.red)
    .option('-d, --dictionary [file]'   , 'dicionário a ser utilizado ' + msgDefault.red)
    .parse(process.argv);


if (!program.configFile || program.configFile === true) {
    program.configFile = __dirname + '/config.js';
}

var configFileName = path.resolve(program.configFile).charAt(0) == path.sep 
    ? path.resolve(program.configFile) :  path.resolve('./' + program.configFile);

console.log('Config file....: %s', configFileName);

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
            
            fs.readFile(fileName, 'UTF-8', function(err, data) {
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
            files && files.forEach(function(fileOrDir) {
                if (!fileOrDir.match(/^\./)) {
                    checkSpellOfDir(dir + '/' + fileOrDir, callback);
                }                
            });
        });        
        
    } else {
        checkSpellOfFile(dir, callback);
    }
}

var pathOfDict = config.dictionary;

if (program.dictionary && program.dictionary !== true) {
    pathOfDict = program.dictionary;
}

pathOfDict = path.resolve(pathOfDict).charAt(0) == path.sep 
    ? path.resolve(pathOfDict) : path.resolve('./' + pathOfDict);

console.log('Dictionary file: %s', pathOfDict);

if (!fs.existsSync(pathOfDict) || !fs.statSync(pathOfDict).isFile()) {
    console.log('Erro: '.red + 'O arquivo \'' + pathOfDict + '\' não existe!');
    return 1;
}

// Dicionario
var dict = require(pathOfDict);

// Removendo duplicados.
dict = dict.filter(function(elem, pos, self) {
    return self.indexOf(elem) == pos;
});

// Erros
var filesErrors = {};

console.log('Total de palavaras no dicionário: ' + (dict.length > 0 ? ('' + dict.length).green : ('' + dict.length).red), '\n');


var dirs = config.dirs;

// O usuario forneceu no comando um diretorio ou arquivo, entao ignora o diretorio da configuracao.
if (program.path && program.path !== true) {
    dirs = [program.path];
}

dirs.forEach(function(dir, i) {
    
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
                outOfDict.indexOf(token) == -1 && outOfDict.push(token);
            }
        });
                
        if (errors == 0) {
            //console.log('       ' + 'OK'.blue + '       : ' + fileName);
        } else {
            
            filesErrors[fileName] = outOfDict;
            
            console.log('Erro -> ' + ('' + errors).red + ' falhas: ' + fileName);
        }
    });
});

process.on('exit', function() {
    console.log('\n\n==== ERROS ====\n'.red);
    
    var totalErrs = 0;
    
    for (var fileName in filesErrors) {
        console.log(fileName + ': \n', filesErrors[fileName], '\n');
        
        totalErrs += filesErrors[fileName].length;
    }
    
    console.log("Total de erros: %d".red, totalErrs);
});

