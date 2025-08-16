// vite.config.ts
import { defineConfig, loadEnv } from "file:///C:/Users/USER/Downloads/CROPGENIUS-main/CROPGENIUS-main/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/USER/Downloads/CROPGENIUS-main/CROPGENIUS-main/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { resolve } from "path";
import { componentTagger } from "file:///C:/Users/USER/Downloads/CROPGENIUS-main/CROPGENIUS-main/node_modules/lovable-tagger/dist/index.js";
import { visualizer } from "file:///C:/Users/USER/Downloads/CROPGENIUS-main/CROPGENIUS-main/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
var __vite_injected_original_dirname = "C:\\Users\\USER\\Downloads\\CROPGENIUS-main\\CROPGENIUS-main";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    base: "/",
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      mode === "production" && visualizer({
        filename: "dist/bundle-analysis.html",
        open: false,
        gzipSize: true,
        brotliSize: true
      })
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": resolve(__vite_injected_original_dirname, "./src")
      }
    },
    server: {
      host: "::",
      port: 8080,
      open: true
    },
    esbuild: {
      logOverride: { "this-is-undefined-in-esm": "silent" },
      target: "es2020",
      ...mode === "production" && {
        tsconfigRaw: {
          compilerOptions: {
            skipLibCheck: true,
            noUnusedLocals: false,
            noUnusedParameters: false,
            strict: false
          }
        }
      }
    },
    build: {
      chunkSizeWarningLimit: 3e3,
      target: "es2020",
      minify: "esbuild",
      cssCodeSplit: true,
      cssMinify: true,
      rollupOptions: {
        output: {
          format: "es",
          entryFileNames: "assets/[name]-[hash:8].js",
          chunkFileNames: "assets/[name]-[hash:8].js",
          assetFileNames: "assets/[name]-[hash:8].[ext]",
          manualChunks: {
            "mapbox": ["mapbox-gl"],
            "vendor": ["react", "react-dom", "react-router-dom"],
            "ui": ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-select"]
          }
        },
        treeshake: true
      },
      sourcemap: false,
      reportCompressedSize: true
    },
    define: {
      "process.env": env,
      global: "globalThis"
    },
    optimizeDeps: {
      include: ["react", "react-dom"],
      exclude: ["lucide-react"]
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxVU0VSXFxcXERvd25sb2Fkc1xcXFxDUk9QR0VOSVVTLW1haW5cXFxcQ1JPUEdFTklVUy1tYWluXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxVU0VSXFxcXERvd25sb2Fkc1xcXFxDUk9QR0VOSVVTLW1haW5cXFxcQ1JPUEdFTklVUy1tYWluXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9VU0VSL0Rvd25sb2Fkcy9DUk9QR0VOSVVTLW1haW4vQ1JPUEdFTklVUy1tYWluL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xyXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCdcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCJcclxuaW1wb3J0IHsgdmlzdWFsaXplciB9IGZyb20gJ3JvbGx1cC1wbHVnaW4tdmlzdWFsaXplcidcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcclxuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksICcnKVxyXG4gIFxyXG4gIHJldHVybiB7XHJcbiAgICBiYXNlOiAnLycsXHJcbiAgICBwbHVnaW5zOiBbXHJcbiAgICAgIHJlYWN0KCksXHJcbiAgICAgIG1vZGUgPT09ICdkZXZlbG9wbWVudCcgJiYgY29tcG9uZW50VGFnZ2VyKCksXHJcbiAgICAgIG1vZGUgPT09ICdwcm9kdWN0aW9uJyAmJiB2aXN1YWxpemVyKHtcclxuICAgICAgICBmaWxlbmFtZTogJ2Rpc3QvYnVuZGxlLWFuYWx5c2lzLmh0bWwnLFxyXG4gICAgICAgIG9wZW46IGZhbHNlLFxyXG4gICAgICAgIGd6aXBTaXplOiB0cnVlLFxyXG4gICAgICAgIGJyb3RsaVNpemU6IHRydWVcclxuICAgICAgfSlcclxuICAgIF0uZmlsdGVyKEJvb2xlYW4pLFxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICBhbGlhczoge1xyXG4gICAgICAgIFwiQFwiOiByZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBzZXJ2ZXI6IHtcclxuICAgICAgaG9zdDogXCI6OlwiLFxyXG4gICAgICBwb3J0OiA4MDgwLFxyXG4gICAgICBvcGVuOiB0cnVlXHJcbiAgICB9LFxyXG4gICAgZXNidWlsZDoge1xyXG4gICAgICBsb2dPdmVycmlkZTogeyAndGhpcy1pcy11bmRlZmluZWQtaW4tZXNtJzogJ3NpbGVudCcgfSxcclxuICAgICAgdGFyZ2V0OiAnZXMyMDIwJyxcclxuICAgICAgLi4uKG1vZGUgPT09ICdwcm9kdWN0aW9uJyAmJiB7XHJcbiAgICAgICAgdHNjb25maWdSYXc6IHtcclxuICAgICAgICAgIGNvbXBpbGVyT3B0aW9uczoge1xyXG4gICAgICAgICAgICBza2lwTGliQ2hlY2s6IHRydWUsXHJcbiAgICAgICAgICAgIG5vVW51c2VkTG9jYWxzOiBmYWxzZSxcclxuICAgICAgICAgICAgbm9VbnVzZWRQYXJhbWV0ZXJzOiBmYWxzZSxcclxuICAgICAgICAgICAgc3RyaWN0OiBmYWxzZVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBidWlsZDoge1xyXG4gICAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDMwMDAsXHJcbiAgICAgIHRhcmdldDogJ2VzMjAyMCcsXHJcbiAgICAgIG1pbmlmeTogJ2VzYnVpbGQnLFxyXG4gICAgICBjc3NDb2RlU3BsaXQ6IHRydWUsXHJcbiAgICAgIGNzc01pbmlmeTogdHJ1ZSxcclxuICAgICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAgIG91dHB1dDoge1xyXG4gICAgICAgICAgZm9ybWF0OiAnZXMnLFxyXG4gICAgICAgICAgZW50cnlGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoOjhdLmpzJyxcclxuICAgICAgICAgIGNodW5rRmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaDo4XS5qcycsXHJcbiAgICAgICAgICBhc3NldEZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2g6OF0uW2V4dF0nLFxyXG4gICAgICAgICAgbWFudWFsQ2h1bmtzOiB7XHJcbiAgICAgICAgICAgICdtYXBib3gnOiBbJ21hcGJveC1nbCddLFxyXG4gICAgICAgICAgICAndmVuZG9yJzogWydyZWFjdCcsICdyZWFjdC1kb20nLCAncmVhY3Qtcm91dGVyLWRvbSddLFxyXG4gICAgICAgICAgICAndWknOiBbJ0ByYWRpeC11aS9yZWFjdC1kaWFsb2cnLCAnQHJhZGl4LXVpL3JlYWN0LWRyb3Bkb3duLW1lbnUnLCAnQHJhZGl4LXVpL3JlYWN0LXNlbGVjdCddXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0cmVlc2hha2U6IHRydWVcclxuICAgICAgfSxcclxuICAgICAgc291cmNlbWFwOiBmYWxzZSxcclxuICAgICAgcmVwb3J0Q29tcHJlc3NlZFNpemU6IHRydWVcclxuICAgIH0sXHJcbiAgICBkZWZpbmU6IHtcclxuICAgICAgJ3Byb2Nlc3MuZW52JzogZW52LFxyXG4gICAgICBnbG9iYWw6ICdnbG9iYWxUaGlzJ1xyXG4gICAgfSxcclxuICAgIG9wdGltaXplRGVwczoge1xyXG4gICAgICBpbmNsdWRlOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbSddLFxyXG4gICAgICBleGNsdWRlOiBbJ2x1Y2lkZS1yZWFjdCddXHJcbiAgICB9XHJcbiAgfVxyXG59KSJdLAogICJtYXBwaW5ncyI6ICI7QUFBbVcsU0FBUyxjQUFjLGVBQWU7QUFDelksT0FBTyxXQUFXO0FBQ2xCLFNBQVMsZUFBZTtBQUN4QixTQUFTLHVCQUF1QjtBQUNoQyxTQUFTLGtCQUFrQjtBQUozQixJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN4QyxRQUFNLE1BQU0sUUFBUSxNQUFNLFFBQVEsSUFBSSxHQUFHLEVBQUU7QUFFM0MsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLE1BQ1AsTUFBTTtBQUFBLE1BQ04sU0FBUyxpQkFBaUIsZ0JBQWdCO0FBQUEsTUFDMUMsU0FBUyxnQkFBZ0IsV0FBVztBQUFBLFFBQ2xDLFVBQVU7QUFBQSxRQUNWLE1BQU07QUFBQSxRQUNOLFVBQVU7QUFBQSxRQUNWLFlBQVk7QUFBQSxNQUNkLENBQUM7QUFBQSxJQUNILEVBQUUsT0FBTyxPQUFPO0FBQUEsSUFDaEIsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxNQUNqQztBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxJQUNSO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxhQUFhLEVBQUUsNEJBQTRCLFNBQVM7QUFBQSxNQUNwRCxRQUFRO0FBQUEsTUFDUixHQUFJLFNBQVMsZ0JBQWdCO0FBQUEsUUFDM0IsYUFBYTtBQUFBLFVBQ1gsaUJBQWlCO0FBQUEsWUFDZixjQUFjO0FBQUEsWUFDZCxnQkFBZ0I7QUFBQSxZQUNoQixvQkFBb0I7QUFBQSxZQUNwQixRQUFRO0FBQUEsVUFDVjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsdUJBQXVCO0FBQUEsTUFDdkIsUUFBUTtBQUFBLE1BQ1IsUUFBUTtBQUFBLE1BQ1IsY0FBYztBQUFBLE1BQ2QsV0FBVztBQUFBLE1BQ1gsZUFBZTtBQUFBLFFBQ2IsUUFBUTtBQUFBLFVBQ04sUUFBUTtBQUFBLFVBQ1IsZ0JBQWdCO0FBQUEsVUFDaEIsZ0JBQWdCO0FBQUEsVUFDaEIsZ0JBQWdCO0FBQUEsVUFDaEIsY0FBYztBQUFBLFlBQ1osVUFBVSxDQUFDLFdBQVc7QUFBQSxZQUN0QixVQUFVLENBQUMsU0FBUyxhQUFhLGtCQUFrQjtBQUFBLFlBQ25ELE1BQU0sQ0FBQywwQkFBMEIsaUNBQWlDLHdCQUF3QjtBQUFBLFVBQzVGO0FBQUEsUUFDRjtBQUFBLFFBQ0EsV0FBVztBQUFBLE1BQ2I7QUFBQSxNQUNBLFdBQVc7QUFBQSxNQUNYLHNCQUFzQjtBQUFBLElBQ3hCO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixlQUFlO0FBQUEsTUFDZixRQUFRO0FBQUEsSUFDVjtBQUFBLElBQ0EsY0FBYztBQUFBLE1BQ1osU0FBUyxDQUFDLFNBQVMsV0FBVztBQUFBLE1BQzlCLFNBQVMsQ0FBQyxjQUFjO0FBQUEsSUFDMUI7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
