import fitz, os, json
from pymongo import MongoClient
connection_string ='mongodb://meuUsuario:minhaSenha123@localhost:27017/Provas'
client = MongoClient(connection_string)
db_connection = client['Provas']
collection = db_connection.get_collection('uel')
ano = "2023"
questoes = []
j =0 
folder_name = "imagens" + ano
os.makedirs(folder_name, exist_ok=True)
extrair =[]
def salvar_imagem(xref, ext,j):
    image_bytes = xref
    image_ext = ext
    control = j
    file_path = os.path.join(folder_name, f"{ano}imagem_{control}.{image_ext}")

    with  open(file_path, "wb") as f:
        f.write(image_bytes)
        control+=1
    return f"{folder_name}/imagem_{control}.png"




doc = fitz.open("prova_uel_2023.pdf")
i=2
indice = "1"
contexto = ""
dentro_contexto = False
dentro_justificativa = False
alternativa_atual = None

while doc.page_count-2 > i:
    pagina = doc.load_page(i) 
    conteudo = pagina.get_text("dict")
    for bloco in conteudo["blocks"]:
        if bloco["type"] == 1:  
            ext = bloco["ext"]  
            xref = bloco["image"]
            extrair.append(salvar_imagem(xref,ext, j))
            contexto += salvar_imagem(xref,ext, j)
            j+=1
        if bloco["type"] == 0:  
            for linha in bloco["lines"]:
                for trecho in linha["spans"]:
                    texto = trecho["text"]
                    if texto == indice and dentro_contexto == False:
                        if contexto:
                            questao['contexto'].append(contexto)  
                        questao = {
                            "ano": ano,
                            "indice":indice,
                            "contexto": [],
                            "alternativas": {},
                            "correcao":{}
                        }
                        dentro_contexto = True
                        questoes.append(questao)
                        alternativa_atual = None    
                        contexto = ''
                        indice = str(int(indice) + 1)
                        dentro_justificativa = False
                        alternativa_letra = "a"
                    elif texto.startswith("Alternativa correta:"):
                        dentro_contexto = False
                        questao["correcao"] = texto
                        dentro_justificativa = True
                    elif texto.startswith(("a)", "b)", "c)", "d)", "e)")) and dentro_justificativa == False:
                        dentro_contexto = False
                        alternativa_letra = texto[0] 
                        questao["alternativas"][alternativa_letra] = texto
                        alternativa_atual = alternativa_letra 
                   
                    elif "questao" in locals() and 'alternativas' in questao and alternativa_atual and texto.strip() and dentro_justificativa == False:
                        dentro_contexto = False
                        dentro_justificativa = False
                        if not texto.startswith(("a)", "b)", "c)", "d)", "e)")):
                            questao["alternativas"][alternativa_atual] += " " + texto
                    elif dentro_contexto == True and not texto.endswith("/ 56") and "Vestibular UEL" not in texto:
                        dentro_justificativa = False
                        contexto += texto
                       # questao['contexto'] += contexto
                       # questao['contexto'].append(texto)
                       # contexto.clear()

                    extrair.append(texto)
    i+=1


def salvar_json(questoes, nome_arquivo="textos_extraidos.json"):
   with open(nome_arquivo, "w", encoding="utf-8") as f:
    json.dump(questoes, f, ensure_ascii=False, indent=4)


salvar_json(questoes)

collection.insert_many(questoes)