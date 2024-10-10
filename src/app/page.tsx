import ImageUploader from '../components/ImageUploader';
import '../app/globals.css'
const Page = () => {
  return (
    <div className='bg-color h-[100vh] '>
      <h1 className='text-[36px] font-bold text-center pt-10'>Upload Image to GitHub</h1>
      <ImageUploader />
    </div>
  );
};

export default Page;
