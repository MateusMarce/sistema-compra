import 'bootstrap-icons/font/bootstrap-icons.css'
import 'react-toastify/dist/ReactToastify.css'
import { useState, useEffect, useRef, useCallback } from 'react'
import axios from './api/axios'
import ModalEnd from './components/ModalEnd'
import ModalHistory from './components/ModalHistory'
import PaymentCard from './components/PaymentCard'
import ServiceCard from './components/ServiceCard'
import ServiceList from './components/ServiceList'
import { ToastContainer, toast } from 'react-toastify'
import { Formik, Form, useField, Field, FormikValues } from 'formik'
import Feedback from 'react-bootstrap/Feedback'
import * as Yup from 'yup'
import ModalCart from './components/ModalCart'
import { formatValue } from 'react-currency-input-field'
import debounce from 'lodash.debounce';
import { pagador, servicos } from './assets/types/type'
import Select from 'react-select'
import MaskedInput from "react-text-mask";


const validation = Yup.object().shape({
    nome: Yup.string().required('Preencha o campo Nome'),
    cpf: Yup.string(),
    unidade: Yup.string().required('Preencha o campo Unidade'),
    local: Yup.string().required('Preencha o campo Local'),
    radio: Yup.number().required('Preencha a forma de pagamento')
  })
const validationPix = Yup.object().shape({
    nome: Yup.string().required('Preencha o campo Nome'),
    cpf: Yup.string().required('Preencha o campo CPF'),
    unidade: Yup.string().required('Preencha o campo Unidade'),
    local: Yup.string().required('Preencha o campo Local'),
    radio: Yup.number().required('Preencha a forma de pagamento')
  })


function App() {
  const [end, setEnd] = useState<boolean>(false)
  const [history, setHistory] = useState<boolean>(false)
  const [historyUser, setHistoryUser] = useState<boolean>(false)
  const [detailsCart, setDetailsCart] = useState<boolean>(false)
  const [servicos, setServicos] = useState<servicos[]>([])
  const [servicosCart, setServicosCart] = useState<servicos[]>([])
  const [search, setSearch] = useState<string>('')
  const [searchName, setSearchName] = useState<boolean>(false)
  const [options, setOptions] = useState<Array<{value:number|string, label:string}>>([])
  const [optionsUser, setOptionsUser] = useState<Array<{value:number|string, label:string}>>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [total, setTotal] = useState<number | string>(0)
  const [type, setType] = useState<string>("1")
  const [devedor, setDevedor] = useState<number>(0)
  const [pagador, setPagador] = useState<pagador>()
  const [locais, setLocais] = useState<Array<any>>([])
  const [paymentCheck, setPaymentCheck] = useState<number | null>(null)
  const [codeSearch, setCodeSearch] = useState<string>('')
  const [menuValue, setMenuValue] = useState<{value:number|string, label:string}>({value:0, label:''})
  const [menuValueName, setMenuValueName] = useState<{value:number|string, label:string}>({value:0, label:''})
  const inputSearch = useRef<HTMLInputElement>(null)
  const formikForm = useRef(null)
  const params = location.pathname.split('/')[2]
  const lista = [
    {nome:'Cart??o'},
    {nome:'Dinheiro'},
    {nome:'PIX'},
    {nome:'Conta'},
  ]


  useEffect(() => {
    (async () => {
      inputSearch.current?.focus()

      let res = await axios.get('produtos')
      setServicos(res.data)
      // let resl = await axios.get('/api/apoio/locais')
      // setLocais(resl.data)
      // let res2 = await axios.get('/api/apoio/unidades')
      // let opt = [0, ...res2?.data].map(local => ({value:local.i_unidade, label:local.nome}))
      // setOptions(opt)


    })()
  }, [])
  
  


  // total da compra
  useEffect(() => {
    let total = 0
    
    total = servicosCart.map(item => Number(item.preco_venda) * Number(item.qtd)).reduce((sum, a) => sum + a, 0)
    setTotal(Number(total).toFixed(3))
  }, [servicosCart, paymentCheck])



  // const handleInputMenuChange = (value:any) => {
  //   if(value != '' && value.length >= 3) {
  //     inputSearchNameFunction(value)
  //   }
  // }
  // const inputSearchNameFunction = useCallback(
	// 	debounce(async (value) => {
  //     try {
  //       setIsLoading(true)
  //       setMenuValueName(value)
  //       setDevedor(0)
  
  //       let res = await axios.get(`/api/apoio/pessoas/${value}`)
  //       let opt = [...res?.data].map(user => ({value:{...user}, label:user.nome_cartao}))
  //       setOptionsUser(opt)

  //       setIsLoading(false)
  //     } catch (error) {
        
  //     }
  //   }, 1500),
	// 	[]
	// )
  

  const handleOpenUser = async (type:string) => {
    setIsLoading(true)
    try {
      let {data} = await axios.get(`usuarios?tipo=${type}`)
      let opt = [...data].map(user => ({value:{...user}, label:user.nome}))
      setOptionsUser(opt)
    } catch (error) {
      
    }
    setIsLoading(false)
  }
  
  

  const HandleMenuChange = async (value:any, setFieldValue:(field: string, value: any, shouldValidate?: boolean | undefined)=>void, name:string, values?:FormikValues) => {
    if(name === 'unidade') {
      setFieldValue(name, value.value, true)
      setMenuValue(value)
    }
    if(name === 'searchName') {
      inputSearchNameChange(value, setFieldValue, values)
    }
  }
  const inputSearchNameChange = useCallback(
    debounce(async (value, setFieldValue, inputs) => {

      let id = toast.loading("Buscando pessoa...")
      setDevedor(0)
      let date = new Date()      
      let year = date.toLocaleString("default", { year: "numeric" })
      let month = date.toLocaleString("default", { month: "2-digit" })
      let day = date.toLocaleString("default", { day: "2-digit" })
      let hours = date.toLocaleString("default", { hour: "2-digit" })
      let minutes = date.toLocaleString("pt-br", { minute: "2-digit" })
      if (parseInt(minutes) < 10) minutes = `0${minutes}`


      let res = await axios.get(`/api/apoio/pessoa/${value.value.cod_biblioteca}`)
      let res2 = await axios.get('/api/apoio/unidades')
      

      if (Object.keys(res.data).length !== 0) {
        toast.update(id, { render: `Encontramos: ${res.data.nome_cartao}`, type: "success", isLoading: false, autoClose: 2000 })
        setSearch('')
        setFieldValue('nome', res.data.nome_cartao)
        setFieldValue('cpf', res.data.cpf)
        setFieldValue('data', `${year}-${month}-${day}T${hours}:${minutes}`)
        setFieldValue('unidade', res.data.i_unidade || 2000003)
        setMenuValue({value:res.data.i_unidade || 2000003, label:res2.data.filter((i:any)=>i.i_unidade == (res.data.i_unidade || 2000003))[0].nome})
        setFieldValue('local', parseFloat(params) || inputs.local || 0)
        setCodeSearch(value.value.cod_biblioteca)
        setPaymentCheck(null)
        setDevedor(res.data.devedor)
        setPagador({
          cpf: res.data.cpf,
          data: `${year}-${month}-${day}T${hours}:${minutes}`,
          nome: res.data.nome_cartao,
          local: parseFloat(params) || inputs.local || 0,
          unidade: res.data.i_unidade || 2000003,
          tipo: res.data.tipo,
          radio:1
        })
      } else {
        toast.done(id)
      }
      
    }, 1000),
		[]
  )



  function OtherField (props: any) {
    const [field] = useField(props.name);
    // if(pagador?.tipo === 'E') {
    //   if(props.values.replaceAll('.','').replace('-','').length === 11) {
    //     console.log('cpf',props.values.replaceAll('.','').replace('-',''));
    //   } else if(props.values.replaceAll('.','').replace('-','').length === 14) {
    //     console.log('cnpj',props.values.replaceAll('.','').replace('-',''));
    //   }
    // }
    
    return props.values.replaceAll('.','').replace('-','').length <= 11 ?
      (
          <MaskedInput mask={[/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/,'.', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]} guide={false} {...field} {...props} />
      ) 
      :
      (
          <MaskedInput mask={[/\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/,'/', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/]} guide={false} {...field} {...props} />
      ) 
  }

  const handleCpfCnpjChange = async (value:string, setFieldValue:any, pagador:pagador|undefined) => {
    setFieldValue('cpf', value)
    
    if(pagador?.tipo === 'E') {
      if(value.replaceAll('.','').replace('-','').length === 11) {
        try {
          let res = await axios.get(`/api/apoio/get/cpf_cnpj/${value.replaceAll('.','').replace('-','')}`)
          setFieldValue('nome', res.data.nome)        
        } catch (error) {
          
        }
      } else if(value.replaceAll('.','').replace('-','').replace('/','').length === 14) {
        try {
          let res = await axios.get(`/api/apoio/get/cpf_cnpj/${value.replaceAll('.','').replace('-','').replace('/','')}`)
          setFieldValue('nome', res.data.nome)
        } catch (error) {
          
        }
      }
    }
  }

  const colourStyles = {
    control: (styles:any) => ({ ...styles, backgroundColor: 'white', height:'100%' }),
    option: (styles:any, { data, isDisabled, isFocused, isSelected, isHover }:any) => {
      return {
        ...styles,
        backgroundColor:isFocused ? '#f1f6fb' : 'white',
        borderBottom:'1px solid var(--bs-gray-400)',
        padding:'5px',
        color: 'black',
        cursor: isDisabled ? 'not-allowed' : 'default'
      };
    },
    menu: (styles:any) => ({
      ...styles, 
      boxShadow: '0 .5rem 2rem rgba(0, 10, 36, 0.158)!important',
      marginTop: 10,
      borderRadius:'0.375rem',
      overflow:'hidden'
    }),
    menuList: (styles:any) => ({
      ...styles,
      backgroundColor: 'white',
      padding:5
    }),
  };

  return (
    <section>
      <ToastContainer/>
      <div className="container-fluid" style={end ? {filter:'blur(3px)'}:{}}>
        <Formik
          initialValues={{ nome: '', cpf: '', local: 0, unidade: '', data: '', radio:1, searchName:'' }}
          validationSchema={paymentCheck === 2 ? validationPix : validation}
          onSubmit={(values: pagador, { setSubmitting }) => {
            // let cpf = values.cpf.replaceAll('.','').replace('-','')
            // setPagador({...values, cpf})
            setPagador(values)
            setEnd(true)
            setSubmitting(false)
          }}
          innerRef={formikForm}
          enableReinitialize
        >
          {({ setFieldValue, errors, touched, values, submitForm }) => (
            <div className="row" style={{height:'100vh'}}>

              {/* left */}
              <div className="col-sm-12 col-md-6 col-lg-7 col-xl-8" style={{height:'100vh'}}>

                {/* search */}
                <div className="row m-3" style={{height:70}}>
                  <div className="col card border-0 p-0 shadow-sm">
                    <div className="card-body p-0 d-flex align-items-center">
                      <div className="col-sm-1 p-3 ps-4">
                        <i className="bi bi-search h4 text-body"></i>
                        
                      </div>
                      <div className="d-flex h-100 col-sm-10">
                        {!searchName ?
                          <input
                            className="form-control-borderless col-sm-10 me-5"
                            type="search"
                            placeholder="Buscar produto"
                            onChange={e => setSearch(e.target.value)}
                            ref={inputSearch}
                            value={search}
                          />
                          :
                          <Select
                            className='basic-single col-sm-10 pe-3 h-100'
                            styles={colourStyles}
                            unstyled
                            options={optionsUser}
                            menuPlacement='auto' 
                            name="searchName"
                            placeholder="Digite um nome..."
                            isLoading={isLoading}
                            onMenuOpen={()=>handleOpenUser(type)}
                            // onChange={(v)=>HandleMenuChange(v, setFieldValue, 'searchName', values)}
                            // onInputChange={(v)=>handleInputMenuChange(v)}
                            value={menuValueName}
                            noOptionsMessage={() => "Sem resultados"}
                          />
                        }
                        <div className='d-flex gap-1 align-items-center position-absolute' style={{right:30, top:20}}>
                          <input type="checkbox" name="seachName" id="searchName" style={{width:20, height:28}} onChange={()=>setSearchName(!searchName)} />
                          <select name="type" onChange={v=>setType(v.target.value)} className="border-0 fw-bold" style={{color:'#2c5028', fontSize:'1rem', outline:0}}>
                            <option value={1}>Buscar Usu??rio</option>
                            <option value={2}>Buscar Clientes</option>
                            <option value={3}>Buscar Alunos</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* itens */}
                <div className='pe-4 ps-3 me-3' style={{height:'calc(100vh - 120px)', overflow:'auto'}}>
                  <div className="row track">
                    {servicos.filter(e =>  e.nome?.toLowerCase().includes(search.toLowerCase())).map(servico => (
                        <ServiceCard
                          key={servico.id}
                          servico={servico}
                          setServicosCart={setServicosCart}
                          servicosCart={servicosCart}
                          setSearch={setSearch}
                        />
                    ))}
                  </div>
                </div>

              </div>

              {/* right */}
              <div className="col-sm-12 col-md-6 col-lg-5 col-xl-4" style={{height:'100vh', overflowY:'auto'}}>

                {/* top cart */}
                <div className="col m-3 p-3 bg-white shadow-sm rounded d-flex align-items-center" style={{height:70}}>
                  
                  <button className='btn ' title='Hist??rico' onClick={_=>setHistory(true)}>
                    <i className="bi bi-clock fs-5"></i>
                  </button>
                  {codeSearch && 
                    <button className='btn d-flex align-items-center w-100' title='Hist??rico do pagador' onClick={()=>{pagador?.nome && setHistoryUser(true)}}>
                      <p className='m-0 me-1'>C??d: </p>
                      <div className='d-flex justify-content-between w-100'>
                        <b>{pagador?.nome}</b>
                      </div>
                    </button>
                  }
                  
                </div>
                

                {/* mid cart */}
                <div className="col" >
                  <div className='p-3 m-3 bg-white shadow-sm rounded'>
                    <div className='d-flex justify-content-between'>
                      <button className='btn px-1' title='Carrinho' onClick={_ => setDetailsCart(!detailsCart)}>
                        <i className="bi bi-cart3 badge-custom fs-5 d-flex align-items-center justify-content-center" data-value={servicosCart.length}></i>
                      </button>
                      <button type="button" className="btn btn-light py-1 shadow-sm" style={{color:'rgb(230, 65, 92)'}} onClick={_ => setServicosCart([])}>
                        <i className="bi bi-trash3"></i> Limpar carrinho
                      </button>
                    </div>
                    <hr/>
                    <div className="col pe-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      <ul className="list-group list-group-flush" >
                        {servicosCart.length != 0 ? servicosCart.map((item,k) => (
                          <ServiceList
                            item={item}
                            key={k}
                            setServicosCart={setServicosCart}
                            servicosCart={servicosCart}
                            setServicos={setServicos}
                            servicos={servicos}
                            paymentCheck={paymentCheck}
                          />
                        ))
                          :
                          <div>
                            <p className='d-flex justify-content-center mb-0 text-secondary h-100 align-items-center' style={{fontSize:18}}>Sem itens no carrinho</p>
                          </div>
                        }
                      </ul>
                    </div>
                  </div>
                </div>


                {/* bot cart */}
                <Form>
                  <div>
                    {devedor > 0 &&
                      <>
                        <div className='mx-3 px-3 d-flex justify-content-between'>
                          <h4>TOTAL ITEM</h4>
                          <h4>R$ {Number(total).toFixed(paymentCheck === 0 ? 3 : 2).replace(".", ",")}</h4>
                        </div>
                        <div className='mx-3 px-3 py-2 mb-2 rounded-3 d-flex justify-content-between total-dev'>
                          <div className='d-flex gap-2' title='O saldo devedor dever?? ser pago, sendo apenas por dinheiro ou PIX.'>
                            <h4 className='mb-0'>SALDO DEVEDOR</h4>
                            <i className="bi bi-info-circle"></i>
                          </div>
                          <h4 className='mb-0'>R$ {formatValue({value: (devedor).toString(), groupSeparator: '.', decimalSeparator: ',', decimalScale: 2})}</h4>
                        </div>
                      </>
                    }
                    <div className='mx-3 px-3 d-flex justify-content-between'>
                      <h4>TOTAL</h4>
                      <h4>{
                        formatValue({
                          value: (Number(total) + devedor || 0).toFixed(2), 
                          groupSeparator: '.', 
                          decimalSeparator: ',',
                          decimalScale: 2, 
                          prefix: 'R$ '
                        })
                        }
                      </h4>
                    </div>

                    <div className='mx-3 p-3 rounded' style={{backgroundColor:'#C5E1A5'}}>
                      <p className='mb-2 fw-bold'>Formas de pagamento:</p>
                      <div className='d-flex gap-2'>
                        {lista.map((i,k)=>(
                          <PaymentCard
                            key={k}
                            keyK={k}
                            nome={i.nome}
                            paymentCheck={paymentCheck}
                            setPaymentCheck={setPaymentCheck}
                            pagador={pagador}
                            setFieldValue={setFieldValue}
                            values={pagador?.unidade}
                            setMenuValue={setMenuValue}
                            options={options}
                          />
                          ))}
                      </div>
                        <Feedback type="invalid" style={{ display: errors.radio && touched.radio ? 'block' : 'none' }}>
                          {errors.radio}
                        </Feedback>
                    </div>

                    {/* form */}
                    <div className='mx-3 mt-4 pt-2 row'>
                      {/* <div className='mb-4 p-0  fw-bold fs-5'>Cadastro da compra:</div> */}
                      <div className='col-sm-6 ps-0'>
                        <div className='shadow-sm p-0 mb-1 custom-input' style={{position:'relative'}}>
                          <p className='ms-3 px-2 rounded-2 p-float shadow-sm' >CPF/CNPJ</p>
                          <OtherField name="cpf" onChange={(e:any)=>handleCpfCnpjChange(e.target.value, setFieldValue, pagador)} values={values.cpf} className="form-control form-control-borderless" disabled={codeSearch != 'C99'}  />
                        </div>
                        <Feedback type="invalid" style={{ display: errors.cpf && touched.cpf ? 'block' : 'none' }}>
                          {errors.cpf}
                        </Feedback>
                      </div>
                      <div className='col-sm-6 pe-0 mb-1'>
                        <div className='shadow-sm p-0' style={{position:'relative'}}>
                          <p className='ms-3 px-2 rounded-2 p-float shadow-sm'>Data</p>
                          {/* <input type="datetime-local" className='form-control form-control-borderless' value={pessoa?.data} onChange={e => setPessoa({...pessoa, data: e.target.value})} /> */}
                          <Field name="data" type="datetime-local" className="form-control form-control-borderless" />
                        </div>
                      </div>
                      <div className='col-sm-12 px-0 mt-4 mb-1 '>
                        <div className='shadow-sm p-0 custom-input' style={{position:'relative'}}>
                          <p className='ms-3 px-2 rounded-2 p-float shadow-sm' >Nome</p>
                          <Field name="nome" className="form-control form-control-borderless" disabled={codeSearch != 'C99'} />
                        </div>
                        <Feedback type="invalid" style={{ display: errors.nome && touched.nome ? 'block' : 'none' }}>
                          {errors.nome}
                        </Feedback>
                      </div>
                      <div className='col-sm-6 ps-0 mt-4'>
                        <div className='shadow-sm p-0' style={{position:'relative'}}>
                          <p className='ms-3 px-2 rounded-2 p-float shadow-sm' >Local</p>
                          <Field as="select" name="local" className='form-control form-control-borderless'>
                            {[0, ...locais].map(local => (
                              <option key={local.i_local | local} value={local.i_local}>{local.nome}</option>
                            ))}
                          </Field>

                          {/* <Select
                            className='basic-single'
                            classNamePrefix="select"
                            options={optionsLocal}
                            menuPlacement='auto' 
                            name="local"
                            onMenuOpen={HandleMenuOpen}
                            onChange={(v)=>HandleMenuChange(v, setFieldValue, 'local')}
                          /> */}
                        </div>
                          <Feedback type="invalid" style={{ display: errors.local && touched.local ? 'block' : 'none' }}>
                            {errors.local}
                          </Feedback>
                      </div>
                      <div className='col-sm-6 pe-0 mt-4'>
                        <div className='shadow-sm p-0' style={{position:'relative'}}>
                          <p className='ms-3 px-2 rounded-2 p-float shadow-sm'>Unidade</p>
                          {/* <Field name="unidade" className="form-control form-control-borderless" /> */}
                          <Select
                            className='basic-single'
                            classNamePrefix="select"
                            options={options}
                            styles={colourStyles}
                            menuPlacement='auto' 
                            name="unidade"
                            noOptionsMessage={()=>'Sem resultados'}
                            onChange={(v)=>HandleMenuChange(v, setFieldValue, 'unidade')}
                            value={menuValue}
                          />
                        </div>
                        <Feedback type="invalid" style={{ display: errors.unidade && touched.unidade ? 'block' : 'none' }}>
                          {errors.unidade}
                        </Feedback>
                      </div>
                    </div>
                    <button 
                      className='mx-3 my-3 fs-4 text-light btn-original' 
                      type='submit' 
                      onClick={()=>submitForm()} 
                      disabled={paymentCheck === null || (Number(total) + devedor) === 0 || !pagador}
                    >
                      FINALIZAR COMPRA
                    </button>
                  </div>
                </Form>


              </div>
            </div>
          )}
        </Formik>
      </div>

      {end && (
        <ModalEnd
          setEnd={setEnd}
          mode={paymentCheck}
          list={servicosCart}
          total={total}
          devedor={devedor}
          pagador={pagador}
          codesearch={codeSearch}
          setServicosCart={setServicosCart}
          setPaymentCheck={setPaymentCheck}
          paymentCheck={paymentCheck}
          formikForm={formikForm}
          setDevedor={setDevedor}
          setCodeSearch={setCodeSearch}
        />
      )}
      {history &&
        <ModalHistory setHistory={setHistory} history={history} pagador={pagador} />
      }
      {historyUser &&
        <ModalHistory setHistoryUser={setHistoryUser} historyUser={historyUser} pagador={pagador} />
      }
      {detailsCart &&
        <ModalCart setDetailsCart={setDetailsCart} list={servicosCart} total={total} paymentCheck={paymentCheck} />
      }
    </section>
  )
}

export default App