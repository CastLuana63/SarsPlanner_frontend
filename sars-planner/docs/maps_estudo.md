1. Open-source ou gratuito?
    - Google Maps: É proprietário e pago (modelo Freemium). O Google dá um crédito de US$ 200 gratuitos por mês. Enquanto seu tráfego for baixo, você não paga nada. Se o volume de acessos ou cálculos de rotas subir, você é cobrado em dólar.

    - Leaflet: É open-source e gratuito (licença BSD). O Leaflet é apenas o "motor" que desenha o mapa na tela. As imagens do mapa (tiles) e os cálculos de rota vêm de servidores terceiros (como o OpenStreetMap e o OSRM que configuramos), que podem ser gratuitos ou pagos.

2. Tem limitações de uso?
    - Google Maps: Não tem limitação técnica de bloqueio, desde que você tenha um cartão de crédito válido vinculado à sua conta do Google Cloud. O limite é puramente financeiro.

    - Leaflet: A biblioteca Leaflet não tem nenhum limite. Porém, os provedores gratuitos têm.
        Os servidores públicos do OpenStreetMap e do OSRM (usado no código para traçar a rota azul e calcular o KM) possuem políticas contra abuso. Se o seu SaaS tiver milhares de usuários calculando rotas simultaneamente de forma gratuita, o servidor público deles vai bloquear o IP da aplicação (rate-limiting).

3. Pode usar em produção ou em produto SaaS?
    - Google Maps: Sim, é o padrão-ouro do mercado corporativo. Extremamente estável, rápido e com dados super atualizados. Exige cadastro de cartão de crédito logo na criação da chave da API.

    - Leaflet: Sim, e é amplamente utilizado por gigantes (GitHub, Pinterest, Flickr, Foursquare usam Leaflet). No entanto, para usar Leaflet em um produto SaaS comercial de alto tráfego, a recomendação técnica é usar o Leaflet de graça no frontend. No backend/provedor, assinar um serviço de mapas barato (como Mapbox ou MapTiler) para fornecer as imagens e rotas. Fica incrivelmente mais barato que o Google Maps, mantendo a performance sem risco de bloqueio dos servidores públicos gratuitos.

4. Precisa de API externa
    - Google Maps: O Google já é o pacote completo fechado. Você puxa a biblioteca dele e ela mesma já traz as imagens, calcula a rota, acha endereço, faz tudo. O lado ruim é o travamento tecnológico (vendor lock-in).

    - Leaflet: Sim. Como o Leaflet é só o renderizador visual (o canvas), ele precisa consumir APIs externas. Ele consome a API de imagens do OpenStreetMap e a API de cálculo de rotas do OSRM. Se a API de rota estiver lenta, você troca por outra (como GraphHopper ou Mapbox) trocando apenas 1 linha de código, sem reescrever o mapa.

5. Possui API para poder buscar estado e suas cidades?
    - Google Maps: Sim. Ele possui a Places API e a Geocoding API. Você digita "São Paulo" e ele te devolve cidades, CEPs, coordenadas e preenchimento automático. É excelente, mas cada busca custa centavos de dólar e consome a sua cota mensal.

    - Leaflet: Não. O Leaflet não possui banco de dados de cidades; ele só manipula coordenadas visuais. Para buscar estados e cidades no ecossistema open-source, você precisa de um Geocodificador (como o Nominatim).
        Para buscar todos os Estados (UF) e Municípios brasileiros, use a API oficial do IBGE. É pública, 100% gratuita, sem limites rigorosos, e já retorna o JSON certinho com todos os Estados e as listas completas de cidades de cada UF. Busca as cidades pelo IBGE, salva no banco, e passa as coordenadas para o Leaflet desenhar.
