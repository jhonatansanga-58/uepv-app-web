"use client";

import React, { useEffect, useRef } from "react";
import { Navbar, NavbarBrand, NavbarToggle, NavbarCollapse, NavbarLink, Button, Footer, FooterBrand, FooterLinkGroup, FooterLink, FooterDivider, FooterCopyright } from "flowbite-react";
import { HiCheck, HiPlay, HiLocationMarker, HiPhone, HiMail } from "react-icons/hi";

// Animación simple de Scroll con Intersection Observer
const FadeInOnScroll = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
  const domRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("opacity-100");
          entry.target.classList.add("translate-y-0");
        }
      });
    });
    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => { if (currentRef) observer.unobserve(currentRef); };
  }, []);

  return (
    <div 
      ref={domRef} 
      className={`opacity-0 translate-y-10 transition-all duration-1000 ease-out`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* NAVBAR */}
      <Navbar fluid rounded className="fixed w-full z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100">
        <NavbarBrand href="/">
          <img src="/escudo.png" className="mr-2 h-9 sm:mr-3 sm:h-12" alt="Escudo Institucional" />
          <span className="self-center whitespace-nowrap text-lg sm:text-xl font-bold text-[var(--color-primary-900)] sm:hidden">
            UEPV
          </span>
          <span className="self-center whitespace-nowrap text-xl font-bold text-[var(--color-primary-900)] hidden sm:inline-block">
            Unidad Educativa
          </span>
        </NavbarBrand>
        <div className="flex md:order-2 space-x-2 items-center">
          <Button href="/login" className="bg-[var(--color-primary-900)] enabled:hover:bg-[var(--color-primary-800)] text-white shadow-md text-sm sm:text-base font-semibold">
            <span className="hidden min-[380px]:inline">Portal Académico</span>
            <span className="min-[380px]:hidden">Portal</span>
          </Button>
          <NavbarToggle />
        </div>
        <NavbarCollapse>
          <NavbarLink href="#inicio" active>Inicio</NavbarLink>
          <NavbarLink href="#nosotros">Nosotros</NavbarLink>
          <NavbarLink href="#galeria">Galería</NavbarLink>
          <NavbarLink href="#contacto">Contacto</NavbarLink>
        </NavbarCollapse>
      </Navbar>

      {/* HERO SECTION */}
      <section id="inicio" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[var(--color-primary-100)] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-[20%] left-[-10%] w-72 h-72 bg-[var(--color-secondary-100)] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-20%] left-[20%] w-80 h-80 bg-[var(--color-primary-200)] rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-6 text-center z-10">
          <FadeInOnScroll>
            <img src="/escudo.png" alt="Escudo Institucional" className="h-32 md:h-40 mx-auto mb-8 drop-shadow-xl animate-fade-in-up" />
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Excelencia Educativa <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary-900)] to-[var(--color-secondary-600)]">
                Para el Futuro de tus Hijos
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Formando líderes con valores y conocimientos sólidos. Descubre nuestra plataforma de gestión académica integral diseñada para conectar a padres, estudiantes y maestros.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button href="/login" size="xl" className="bg-[var(--color-primary-900)] enabled:hover:bg-[var(--color-primary-800)] shadow-lg shadow-purple-900/20 w-full sm:w-auto">
                Ingresar al Sistema
              </Button>
              <Button color="light" size="xl" href="#nosotros" className="w-full sm:w-auto">
                Conoce más acerca de nosotros
              </Button>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* CARACTERÍSTICAS / DESCRIPCIÓN */}
      <section id="nosotros" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <FadeInOnScroll>
              <h2 className="text-3xl font-bold text-[var(--color-primary-900)] mb-4">¿Por qué elegirnos?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Nuestro compromiso es brindar una educación integral apoyada por la mejor tecnología para el control y seguimiento académico.</p>
            </FadeInOnScroll>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FadeInOnScroll delay={100}>
              <div className="bg-slate-50 rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <HiCheck className="w-8 h-8 text-[var(--color-primary-600)]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Seguimiento Biométrico</h3>
                <p className="text-gray-600">Registro de asistencia ultra seguro utilizando tecnología de huella dactilar, garantizando la seguridad del alumnado.</p>
              </div>
            </FadeInOnScroll>

            <FadeInOnScroll delay={300}>
              <div className="bg-slate-50 rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <HiPlay className="w-8 h-8 text-[var(--color-secondary-600)]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Conexión a Tiempo Real</h3>
                <p className="text-gray-600">Padres informados constantemente a través de nuestra App Móvil con notificaciones directas sobre tareas y comunicados.</p>
              </div>
            </FadeInOnScroll>

            <FadeInOnScroll delay={500}>
              <div className="bg-[var(--color-primary-900)] rounded-2xl p-8 shadow-xl text-white transform hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full"></div>
                <h3 className="text-xl font-bold mb-3">Nuestra Misión y Visión</h3>
                <p className="text-purple-100 text-sm mb-4">
                  <strong>Misión:</strong> Brindar una educación de excelencia en valores. <br/><br/>
                  <strong>Visión:</strong> Ser líderes indiscutibles en la formación académica regional.
                </p>
                <div className="h-1 w-12 bg-[var(--color-secondary-400)] rounded-full"></div>
              </div>
            </FadeInOnScroll>
          </div>
        </div>
      </section>

      {/* GALERÍA PLACEHOLDER */}
      <section id="galeria" className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <FadeInOnScroll>
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Vida Estudiantil</h2>
                <p className="text-gray-600">Un vistazo a nuestras instalaciones y actividades.</p>
              </div>
            </div>
          </FadeInOnScroll>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FadeInOnScroll delay={100}>
              <div className="bg-gray-200 h-48 md:h-64 rounded-xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gray-300 flex items-center justify-center text-gray-500 font-medium">Imagen Aula 1</div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white font-semibold">Instalaciones</span>
                </div>
              </div>
            </FadeInOnScroll>
            <FadeInOnScroll delay={200}>
              <div className="col-span-2 bg-gray-200 h-48 md:h-64 rounded-xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gray-300 flex items-center justify-center text-gray-500 font-medium">Actividad Deportiva / Principal</div>
                <div className="absolute inset-0 bg-[var(--color-primary-900)]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white font-semibold flex items-center gap-2">Ver más detalles</span>
                </div>
              </div>
            </FadeInOnScroll>
            <FadeInOnScroll delay={300}>
               <div className="bg-gray-200 h-48 md:h-64 rounded-xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gray-300 flex items-center justify-center text-gray-500 font-medium">Laboratorio</div>
              </div>
            </FadeInOnScroll>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE CONTACTO */}
      <section id="contacto" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="grid md:grid-cols-2">
              <div className="p-10 md:p-16 bg-[var(--color-primary-900)] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                <FadeInOnScroll>
                  <h3 className="text-3xl font-bold mb-6">Contáctanos</h3>
                  <p className="text-purple-100 mb-8 max-w-sm">
                    Inscripciones abiertas. Contamos con turnos en la mañana y en la tarde para adaptarnos a tus necesidades.
                  </p>
                  <ul className="space-y-6">
                    <li className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <HiLocationMarker className="w-5 h-5 text-[var(--color-secondary-400)]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">Dirección</h4>
                        <p className="text-purple-200">Av. Principal #123, Ciudad, País.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <HiPhone className="w-5 h-5 text-[var(--color-secondary-400)]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">Teléfono</h4>
                        <p className="text-purple-200">+591 60000000</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <HiMail className="w-5 h-5 text-[var(--color-secondary-400)]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">Correo Electrónico</h4>
                        <p className="text-purple-200">info@colegio.edu</p>
                      </div>
                    </li>
                  </ul>
                </FadeInOnScroll>
              </div>
              <div className="p-10 md:p-16 bg-gray-50 flex items-center justify-center min-h-[400px]">
                {/* Mapa Placeholder */}
                 <FadeInOnScroll delay={200}>
                  <div className="w-full text-center">
                    <div className="w-full h-64 bg-gray-200 rounded-xl mb-4 flex items-center justify-center shadow-inner border border-gray-300">
                      <span className="text-gray-500 flex flex-col items-center">
                        <HiLocationMarker className="w-12 h-12 mb-2 text-gray-400" />
                        [Widget de Google Maps aquí]
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">Pronto podrás visualizar nuestra ubicación satelital.</p>
                  </div>
                 </FadeInOnScroll>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer container className="rounded-none bg-gray-900 border-none">
        <div className="w-full text-center py-6">
          <div className="w-full justify-between sm:flex sm:items-center sm:justify-between px-6">
            <FooterBrand
              href="/"
              src="/escudo.png"
              alt="Logo"
              name="Unidad Educativa"
              className="text-white grayscale brightness-200"
            />
            <FooterLinkGroup className="mt-4 sm:mt-0 text-gray-400">
              <FooterLink href="#">Política de Privacidad</FooterLink>
              <FooterLink href="#">Términos y Condiciones</FooterLink>
              <FooterLink href="/login">Portal de Acceso</FooterLink>
            </FooterLinkGroup>
          </div>
          <FooterDivider className="border-gray-700" />
          <FooterCopyright href="#" by="Unidad Educativa™" year={new Date().getFullYear()} className="text-gray-400" />
        </div>
      </Footer>

      {/* Global CSS for some simple keyframes (blobs animation) */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out forwards;
        }
        html { scroll-behavior: smooth; }
      `}} />
    </div>
  );
}
