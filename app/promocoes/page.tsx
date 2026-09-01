import PaginaCategoria from '../../components/categorias/PaginaCategoria';

export default function PromocoesPage() {
  return (
    <PaginaCategoria
      titulo="Promoções"
      descricao="Ofertas, descontos e oportunidades dos comércios de Nova União."
      categoriaBanco="Promoções"
      corHero="from-orange-600 to-red-700"
      imagemHero="/images/categorias/promocoes.png"
      imagemPadrao="/images/categorias/promocoes.png"
      corDestaque="bg-orange-600"
      placeholderBusca="Pesquisar promoção, produto ou estabelecimento..."
      textoVazio="Ainda não existem promoções disponíveis."
    />
  );
}
