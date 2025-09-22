import { createClient } from "@supabase/supabase-js";

import { CarouselForm } from "./components/carousel-form";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const CarouselPage = async ({
  params
}: {
  params: { carouselId: string, storeId: string }
}) => {
  let carousel = null;

  if (params.carouselId !== 'new') {
    try {
      const { data, error } = await supabase
        .from('carousel')
        .select('*')
        .eq('id', params.carouselId)
        .eq('store_id', params.storeId)
        .single();

      if (error) {
        console.error('Error fetching carousel item:', error);
      } else {
        carousel = data;
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  return ( 
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CarouselForm initialData={carousel} />
      </div>
    </div>
  );
}
 
export default CarouselPage;