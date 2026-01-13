import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';

export interface SeoData {
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_type?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_card?: string;
  twitter_image?: string;
  canonical?: string;
  robots?: string;
  structure_schema?: string;
}

export interface LanguageSeoData {
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  twitter_title?: string | null;
  twitter_description?: string | null;
  canonical?: string | null;
  structure_schema?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private defaultTitle = 'Golden Oceans - Premium Travel Experiences';
  private defaultDescription =
    'Discover amazing tours and travel experiences with Golden Oceans. Book your dream vacation today.';
  private defaultImage = '/assets/image/golden ocean/Artboard 2.png';
  private siteUrl = 'https://backend-goldenoceans.perfectsolutions4u.com';

  constructor(
    private meta: Meta,
    private title: Title,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  updateSeoData(
    seoData: SeoData,
    fallbackTitle?: string,
    fallbackDescription?: string,
    fallbackImage?: string
  ): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const title =
      seoData.meta_title ||
      seoData.og_title ||
      fallbackTitle ||
      this.defaultTitle;
    const description =
      seoData.meta_description ||
      seoData.og_description ||
      fallbackDescription ||
      this.defaultDescription;
    const image =
      seoData.og_image ||
      seoData.twitter_image ||
      fallbackImage ||
      this.defaultImage;
    const keywords = seoData.meta_keywords || '';
    const canonical = seoData.canonical || '';
    const robots = seoData.robots || 'index, follow';

    // Update title
    this.title.setTitle(title);

    // Update or create meta tags
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'keywords', content: keywords });
    this.meta.updateTag({ name: 'robots', content: robots });

    // Open Graph tags
    this.meta.updateTag({
      property: 'og:title',
      content: seoData.og_title || title,
    });
    this.meta.updateTag({
      property: 'og:description',
      content: seoData.og_description || description,
    });
    this.meta.updateTag({
      property: 'og:image',
      content: this.getFullImageUrl(image),
    });
    this.meta.updateTag({
      property: 'og:type',
      content: seoData.og_type || 'website',
    });
    this.meta.updateTag({
      property: 'og:url',
      content: canonical || this.getCurrentUrl(),
    });

    // Twitter Card tags
    this.meta.updateTag({
      name: 'twitter:card',
      content: seoData.twitter_card || 'summary_large_image',
    });
    this.meta.updateTag({
      name: 'twitter:title',
      content: seoData.twitter_title || title,
    });
    this.meta.updateTag({
      name: 'twitter:description',
      content: seoData.twitter_description || description,
    });
    if (seoData.twitter_image) {
      this.meta.updateTag({
        name: 'twitter:image',
        content: this.getFullImageUrl(seoData.twitter_image),
      });
    }

    // Canonical URL
    if (canonical) {
      this.updateCanonicalUrl(canonical);
    }

    // Structured data (JSON-LD)
    if (seoData.structure_schema) {
      this.updateStructuredData(seoData.structure_schema);
    }
  }

  private updateCanonicalUrl(url: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    let link: HTMLLinkElement | null = document.querySelector(
      "link[rel='canonical']"
    );
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private updateStructuredData(schema: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Remove existing structured data
    const existingScript = document.querySelector(
      'script[type="application/ld+json"]'
    );
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    try {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = schema;
      document.head.appendChild(script);
    } catch (error) {
      console.error('Error adding structured data:', error);
    }
  }

  private getFullImageUrl(image: string): string {
    if (!image) {
      return this.defaultImage;
    }
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    if (image.startsWith('/')) {
      return `${this.siteUrl}${image}`;
    }
    return `${this.siteUrl}/${image}`;
  }

  private getCurrentUrl(): string {
    if (!isPlatformBrowser(this.platformId)) {
      return this.siteUrl;
    }
    return window.location.href;
  }

  resetToDefaults(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.title.setTitle(this.defaultTitle);
    this.meta.updateTag({
      name: 'description',
      content: this.defaultDescription,
    });
    this.meta.updateTag({ property: 'og:title', content: this.defaultTitle });
    this.meta.updateTag({
      property: 'og:description',
      content: this.defaultDescription,
    });
    this.meta.updateTag({
      property: 'og:image',
      content: this.getFullImageUrl(this.defaultImage),
    });
  }

  /**
   * Extracts SEO data from settings API response and converts it to SeoData format
   * @param settingsResponse - The settings API response array
   * @param language - The language code to use (defaults to 'en')
   * @returns SeoData object with extracted values or empty object if not found
   */
  extractSeoFromSettings(
    settingsResponse: any[],
    language: string = 'en'
  ): SeoData {
    if (!settingsResponse || !Array.isArray(settingsResponse)) {
      return {};
    }

    const seoSetting = settingsResponse.find(
      (item: any) => item.option_key === 'seo'
    );

    if (!seoSetting || !seoSetting.option_value) {
      return {};
    }

    const seoValue = seoSetting.option_value;
    const langData = seoValue[language] || seoValue['en'] || {};

    // Extract language-specific data, only including properties with actual values
    const seoData: SeoData = {};

    if (langData.meta_title) seoData.meta_title = langData.meta_title;
    if (langData.meta_description)
      seoData.meta_description = langData.meta_description;
    if (langData.meta_keywords) seoData.meta_keywords = langData.meta_keywords;
    if (langData.og_title) seoData.og_title = langData.og_title;
    if (langData.og_description)
      seoData.og_description = langData.og_description;
    if (langData.twitter_title) seoData.twitter_title = langData.twitter_title;
    if (langData.twitter_description)
      seoData.twitter_description = langData.twitter_description;
    if (langData.canonical) seoData.canonical = langData.canonical;
    if (langData.structure_schema)
      seoData.structure_schema = langData.structure_schema;

    // Global fields (not language-specific)
    if (seoValue.robots) seoData.robots = seoValue.robots;
    if (seoValue.og_type) seoData.og_type = seoValue.og_type;
    if (seoValue.twitter_card) seoData.twitter_card = seoValue.twitter_card;

    return seoData;
  }

  /**
   * Updates SEO data from settings API with fallback to defaults
   * @param settingsResponse - The settings API response array
   * @param language - The language code to use (defaults to 'en')
   * @param fallbackTitle - Optional fallback title
   * @param fallbackDescription - Optional fallback description
   * @param fallbackImage - Optional fallback image
   */
  updateSeoFromSettings(
    settingsResponse: any[],
    language: string = 'en',
    fallbackTitle?: string,
    fallbackDescription?: string,
    fallbackImage?: string
  ): void {
    const seoData = this.extractSeoFromSettings(settingsResponse, language);
    this.updateSeoData(
      seoData,
      fallbackTitle,
      fallbackDescription,
      fallbackImage
    );
  }
}
