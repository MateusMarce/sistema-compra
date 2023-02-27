export interface pagador {
    cpf: string
    data: string
    nome: string
    local: number
    unidade: number | ''
    tipo?: string
    radio:number | string
}

export interface servicos 
    {
        id:string
        codigo:string
        nome:string
        marca: null,
        modelo: null,
        descricao:string
        preco_custo:string
        preco_venda:string
        estoque:string
        controla_estoque:string
        categoria_id:string
        tipo:string
        ativo:string
        qtd:number|string
        criado_em: {
            date:string
            timezone_type: number,
            timezone:string
        },
        atualizado_em: {
            date:string
            timezone_type: number,
            timezone:string
        },
        apagado_em: null
    }
  