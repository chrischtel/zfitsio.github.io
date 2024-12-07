import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs';
import { join } from 'path';

const ZIG_PROJECT_PATH = 'C:/Users/chris/Desktop/zfitsio/';
const ZIG_SRC_DIR = join(ZIG_PROJECT_PATH, 'src');
const OUTPUT_DIR = './src/content/docs/reference';

class DocSection {
    constructor() {
        this.title = '';
        this.description = [];
        this.parameters = [];
        this.returns = [];
        this.errors = [];
        this.examples = [];
        this.code = [];
        this.type = 'function'; // 'function' or 'struct'
        this.methods = []; // For storing struct methods
    }
}

function parseDocComment(line) {
    const cleaned = line.replace(/^[\s]*\/\/\/[\s]?/, '').trimEnd();
    if (cleaned.toLowerCase().startsWith('parameters:')) return { type: 'parameters', content: '' };
    if (cleaned.toLowerCase().startsWith('returns:')) return { type: 'returns', content: '' };
    if (cleaned.toLowerCase().startsWith('errors:')) return { type: 'errors', content: '' };
    if (cleaned.toLowerCase().startsWith('example:')) return { type: 'examples', content: '' };
    return { type: 'description', content: cleaned };
}

function collectStructOrFunction(lines, startIndex) {
    let code = [];
    let i = startIndex;
    let braceCount = 0;
    let isStruct = lines[startIndex].includes('struct');
    let methods = [];
    let currentMethod = null;
    let inDocComment = false;
    let currentDocs = [];
    
    do {
        const line = lines[i].trimEnd();
        
        // Handle doc comments inside struct
        if (isStruct && line.trim().startsWith('///')) {
            inDocComment = true;
            currentDocs.push(line);
            i++;
            continue;
        }
        
        // Handle method definitions inside struct
        if (isStruct && inDocComment && line.trim().startsWith('pub fn')) {
            currentMethod = {
                docs: currentDocs,
                code: [line]
            };
            inDocComment = false;
            currentDocs = [];
        } else if (isStruct && currentMethod) {
            currentMethod.code.push(line);
        } else {
            code.push(line);
        }
        
        // Track braces
        braceCount += (line.match(/{/g) || []).length;
        braceCount -= (line.match(/}/g) || []).length;
        
        // If we're in a struct and we've completed a method, add it to methods array
        if (isStruct && currentMethod && line.trim() === '}') {
            if (braceCount > 0) {  // Only add if we're not at the end of the struct
                methods.push(currentMethod);
                currentMethod = null;
            }
        }
        
        i++;
    } while (braceCount > 0 && i < lines.length);
    
    return {
        code,
        methods,
        endIndex: i - 1,
        isStruct
    };
}

function extractName(codeLine) {
    const structMatch = codeLine.match(/pub\s+const\s+(\w+)\s*=/);
    if (structMatch) return structMatch[1];
    
    const fnMatch = codeLine.match(/pub\s+(?:fn|const)\s+(\w+)/);
    return fnMatch ? fnMatch[1] : '';
}

function parseMethod(method) {
    let section = new DocSection();
    let currentDocType = 'description';
    
    // Parse doc comments
    for (const line of method.docs) {
        const parsed = parseDocComment(line);
        if (parsed.type !== 'description') {
            currentDocType = parsed.type;
        } else if (parsed.content) {
            switch (currentDocType) {
                case 'parameters':
                    section.parameters.push(parsed.content);
                    break;
                case 'returns':
                    section.returns.push(parsed.content);
                    break;
                case 'errors':
                    section.errors.push(parsed.content);
                    break;
                case 'examples':
                    section.examples.push(parsed.content);
                    break;
                default:
                    section.description.push(parsed.content);
            }
        }
    }
    
    // Get method name and code
    section.title = extractName(method.code[0]);
    section.code = method.code;
    
    return section;
}

function generateStructMarkdown(section) {
    let markdown = `## ${section.title}\n\n`;
    
    // Add struct description if any
    if (section.description.length > 0) {
        markdown += `${section.description.join('\n')}\n\n`;
    }
    
    // Add struct definition
    markdown += '```zig\n';
    markdown += section.code.join('\n');
    markdown += '\n```\n\n';
    
    // Add methods
    if (section.methods.length > 0) {
        markdown += '### Methods\n\n';
        
        section.methods.forEach(method => {
            const methodSection = parseMethod(method);
            
            // Method name and description
            markdown += `#### ${methodSection.title}\n\n`;
            if (methodSection.description.length > 0) {
                markdown += `${methodSection.description.join('\n')}\n\n`;
            }
            
            // Method signature
            markdown += '```zig\n';
            markdown += methodSection.code.join('\n');
            markdown += '\n```\n\n';
            
            // Parameters
            if (methodSection.parameters.length > 0) {
                markdown += '**Parameters**\n\n';
                methodSection.parameters.forEach(param => {
                    markdown += `- ${param}\n`;
                });
                markdown += '\n';
            }
            
            // Returns
            if (methodSection.returns.length > 0) {
                markdown += '**Returns**\n\n';
                markdown += methodSection.returns.join('\n');
                markdown += '\n\n';
            }
            
            // Errors
            if (methodSection.errors.length > 0) {
                markdown += '**Errors**\n\n';
                methodSection.errors.forEach(error => {
                    markdown += `- ${error}\n`;
                });
                markdown += '\n';
            }
            
            // Examples
            if (methodSection.examples.length > 0) {
                markdown += '**Examples**\n\n';
                markdown += '```zig\n';
                markdown += methodSection.examples.join('\n');
                markdown += '\n```\n\n';
            }
            
            markdown += '---\n\n';
        });
    }
    
    return markdown;
}

function generateFunctionMarkdown(section) {
    let markdown = `## ${section.title}\n\n`;
    
    if (section.description.length > 0) {
        markdown += `${section.description.join('\n')}\n\n`;
    }
    
    markdown += '```zig\n';
    markdown += section.code.join('\n');
    markdown += '\n```\n\n';
    
    if (section.parameters.length > 0) {
        markdown += '### Parameters\n\n';
        section.parameters.forEach(param => {
            markdown += `- ${param}\n`;
        });
        markdown += '\n';
    }
    
    if (section.returns.length > 0) {
        markdown += '### Returns\n\n';
        markdown += section.returns.join('\n');
        markdown += '\n\n';
    }
    
    if (section.errors.length > 0) {
        markdown += '### Errors\n\n';
        section.errors.forEach(error => {
            markdown += `- ${error}\n`;
        });
        markdown += '\n';
    }
    
    if (section.examples.length > 0) {
        markdown += '### Examples\n\n';
        markdown += '```zig\n';
        markdown += section.examples.join('\n');
        markdown += '\n```\n\n';
    }
    
    markdown += '---\n\n';
    return markdown;
}

function generateMarkdown(content) {
    const lines = content.split('\n');
    let markdown = '';
    let currentSection = new DocSection();
    let currentDocType = 'description';
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trimEnd();
        
        if (line.trim().startsWith('///')) {
            const parsed = parseDocComment(line);
            if (parsed.type !== 'description') {
                currentDocType = parsed.type;
            } else if (parsed.content) {
                switch (currentDocType) {
                    case 'parameters':
                        currentSection.parameters.push(parsed.content);
                        break;
                    case 'returns':
                        currentSection.returns.push(parsed.content);
                        break;
                    case 'errors':
                        currentSection.errors.push(parsed.content);
                        break;
                    case 'examples':
                        currentSection.examples.push(parsed.content);
                        break;
                    default:
                        currentSection.description.push(parsed.content);
                }
            }
            continue;
        }
        
        if (line.trim().startsWith('pub ')) {
            currentSection.title = extractName(line);
            const block = collectStructOrFunction(lines, i);
            currentSection.code = block.code;
            
            if (block.isStruct) {
                currentSection.type = 'struct';
                currentSection.methods = block.methods;
                markdown += generateStructMarkdown(currentSection);
            } else {
                currentSection.type = 'function';
                markdown += generateFunctionMarkdown(currentSection);
            }
            
            i = block.endIndex;
            currentSection = new DocSection();
            currentDocType = 'description';
        }
    }
    
    return markdown;
}

function generateStructMarkdown(section) {
    let markdown = '';
    
    // Add a decorative header for the struct
    markdown += `## ${section.title}\n\n`;
    markdown += `${'━'.repeat(section.title.length + 3)}\n\n`;
    
    // Add struct description if any
    if (section.description.length > 0) {
        markdown += `${section.description.join('\n')}\n\n`;
    }
    
    // Add struct definition with a clear code section header
    markdown += '### Definition\n\n';
    markdown += '```zig\n';
    const cleanedCode = section.code
        .map(line => line.trimEnd())
        .join('\n')
        .replace(/\n\n+/g, '\n\n');
    markdown += cleanedCode;
    markdown += '\n```\n\n';
    
    // Add methods with clear separation
    if (section.methods.length > 0) {
        markdown += '## Methods\n';
        markdown += `${'━'.repeat(8)}\n\n`;
        
        section.methods.forEach((method, index) => {
            const methodSection = parseMethod(method);
            
            // Add visual separator between methods
            if (index > 0) {
                markdown += `\n${'─'.repeat(50)}\n\n`;
            }
            
            // Method name and description
            markdown += `### ${methodSection.title}\n\n`;
            
            if (methodSection.description.length > 0) {
                markdown += `${methodSection.description.join('\n')}\n\n`;
            }
            
            // Method signature in a distinct code block
            markdown += '#### Signature\n\n';
            markdown += '```zig\n';
            const cleanedMethodCode = methodSection.code
                .map(line => line.trimEnd())
                .join('\n')
                .replace(/\n\n+/g, '\n');
            markdown += cleanedMethodCode;
            markdown += '\n```\n\n';
            
            // Parameters in a distinct section
            if (methodSection.parameters.length > 0) {
                markdown += '#### Parameters\n\n';
                methodSection.parameters.forEach(param => {
                    markdown += `• ${param}\n`;
                });
                markdown += '\n';
            }
            
            // Returns in a distinct section
            if (methodSection.returns.length > 0) {
                markdown += '#### Returns\n\n';
                markdown += `${methodSection.returns.join('\n')}\n\n`;
            }
            
            // Errors in a distinct section
            if (methodSection.errors.length > 0) {
                markdown += '#### Errors\n\n';
                methodSection.errors.forEach(error => {
                    markdown += `• ${error}\n`;
                });
                markdown += '\n';
            }
            
            // Examples in a distinct section
            if (methodSection.examples.length > 0) {
                markdown += '#### Examples\n\n';
                markdown += '```zig\n';
                markdown += methodSection.examples.join('\n');
                markdown += '\n```\n\n';
            }
        });
    }
    
    return markdown;
}

function processFiles() {
    try {
        mkdirSync(OUTPUT_DIR, { recursive: true });
        
        const files = readdirSync(ZIG_SRC_DIR)
            .filter(file => file.endsWith('.zig') && file !== 'wrapper.zig');
        
        for (const file of files) {
            try {
                const content = readFileSync(join(ZIG_SRC_DIR, file), 'utf8');
                const moduleName = file.replace('.zig', '');
                
                // Generate table of contents with visual separation
                const toc = `## Contents\n${'━'.repeat(9)}\n\n- [Overview](#overview)\n- [Types](#types)\n- [Methods](#methods)\n\n${'─'.repeat(50)}\n\n`;
                
                const markdown = generateMarkdown(content);
                const outFile = join(OUTPUT_DIR, file.replace('.zig', '.md'));
                
                const finalMarkdown = `---
title: ${moduleName}
description: API documentation for ${moduleName}
sidebar:
    order: 1
---

# ${moduleName}
${'═'.repeat(moduleName.length)}

${toc}

## Overview
${'━'.repeat(9)}

${markdown}`;
                
                writeFileSync(outFile, finalMarkdown);
                console.log(`Generated documentation for: ${file}`);
            } catch (err) {
                console.error(`Error processing ${file}:`, err);
            }
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

processFiles();