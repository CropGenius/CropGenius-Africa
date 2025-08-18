// vite.config.ts
import { defineConfig, loadEnv } from "file:///C:/Users/USER/Downloads/CROPGENIUS-main/CROPGENIUS-main/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/USER/Downloads/CROPGENIUS-main/CROPGENIUS-main/node_modules/@vitejs/plugin-react/dist/index.js";
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
        "@supabase/storage-js": "@supabase/storage-js",
        "@": resolve(__vite_injected_original_dirname, "./src")
      },
      dedupe: ["react", "react-dom"]
    },
    server: {
      // Use default Vite port (5173) to avoid conflicts
      host: "localhost",
      port: 5173,
      strictPort: true,
      open: true,
      hmr: {
        protocol: "ws",
        host: "localhost",
        port: 5173
      },
      watch: {
        usePolling: true
      }
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
        external: ["@supabase/storage-js"]
      },
      commonjsOptions: {
        include: [/node_modules/]
      },
      reportCompressedSize: true
    },
    define: {
      "process.env": env,
      global: "globalThis"
    },
    optimizeDeps: {
      include: ["react", "react-dom"],
      exclude: ["lucide-react", "@supabase/storage-js"]
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxVU0VSXFxcXERvd25sb2Fkc1xcXFxDUk9QR0VOSVVTLW1haW5cXFxcQ1JPUEdFTklVUy1tYWluXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxVU0VSXFxcXERvd25sb2Fkc1xcXFxDUk9QR0VOSVVTLW1haW5cXFxcQ1JPUEdFTklVUy1tYWluXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9VU0VSL0Rvd25sb2Fkcy9DUk9QR0VOSVVTLW1haW4vQ1JPUEdFTklVUy1tYWluL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCJcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tICdyb2xsdXAtcGx1Z2luLXZpc3VhbGl6ZXInXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJylcbiAgXG4gIHJldHVybiB7XG4gICAgYmFzZTogJy8nLFxuICAgIHBsdWdpbnM6IFtcbiAgICAgIHJlYWN0KCksXG4gICAgICBtb2RlID09PSAnZGV2ZWxvcG1lbnQnICYmIGNvbXBvbmVudFRhZ2dlcigpLFxuICAgICAgbW9kZSA9PT0gJ3Byb2R1Y3Rpb24nICYmIHZpc3VhbGl6ZXIoe1xuICAgICAgICBmaWxlbmFtZTogJ2Rpc3QvYnVuZGxlLWFuYWx5c2lzLmh0bWwnLFxuICAgICAgICBvcGVuOiBmYWxzZSxcbiAgICAgICAgZ3ppcFNpemU6IHRydWUsXG4gICAgICAgIGJyb3RsaVNpemU6IHRydWVcbiAgICAgIH0pXG4gICAgXS5maWx0ZXIoQm9vbGVhbiksXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgXCJAc3VwYWJhc2Uvc3RvcmFnZS1qc1wiOiBcIkBzdXBhYmFzZS9zdG9yYWdlLWpzXCIsXG4gICAgICAgIFwiQFwiOiByZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICAgIH0sXG4gICAgICBkZWR1cGU6IFsncmVhY3QnLCAncmVhY3QtZG9tJ11cbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgLy8gVXNlIGRlZmF1bHQgVml0ZSBwb3J0ICg1MTczKSB0byBhdm9pZCBjb25mbGljdHNcbiAgICAgIGhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgICAgcG9ydDogNTE3MyxcbiAgICAgIHN0cmljdFBvcnQ6IHRydWUsXG4gICAgICBvcGVuOiB0cnVlLFxuICAgICAgaG1yOiB7XG4gICAgICAgIHByb3RvY29sOiAnd3MnLFxuICAgICAgICBob3N0OiAnbG9jYWxob3N0JyxcbiAgICAgICAgcG9ydDogNTE3M1xuICAgICAgfSxcbiAgICAgIHdhdGNoOiB7XG4gICAgICAgIHVzZVBvbGxpbmc6IHRydWVcbiAgICAgIH1cbiAgICB9LFxuICAgIGVzYnVpbGQ6IHtcbiAgICAgIGxvZ092ZXJyaWRlOiB7ICd0aGlzLWlzLXVuZGVmaW5lZC1pbi1lc20nOiAnc2lsZW50JyB9LFxuICAgICAgdGFyZ2V0OiAnZXMyMDIwJyxcbiAgICAgIC4uLihtb2RlID09PSAncHJvZHVjdGlvbicgJiYge1xuICAgICAgICB0c2NvbmZpZ1Jhdzoge1xuICAgICAgICAgIGNvbXBpbGVyT3B0aW9uczoge1xuICAgICAgICAgICAgc2tpcExpYkNoZWNrOiB0cnVlLFxuICAgICAgICAgICAgbm9VbnVzZWRMb2NhbHM6IGZhbHNlLFxuICAgICAgICAgICAgbm9VbnVzZWRQYXJhbWV0ZXJzOiBmYWxzZSxcbiAgICAgICAgICAgIHN0cmljdDogZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSxcbiAgICBidWlsZDoge1xuICAgICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAzMDAwLFxuICAgICAgdGFyZ2V0OiAnZXMyMDIwJyxcbiAgICAgIG1pbmlmeTogJ2VzYnVpbGQnLFxuICAgICAgY3NzQ29kZVNwbGl0OiB0cnVlLFxuICAgICAgY3NzTWluaWZ5OiB0cnVlLFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICBmb3JtYXQ6ICdlcycsXG4gICAgICAgICAgZW50cnlGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoOjhdLmpzJyxcbiAgICAgICAgICBjaHVua0ZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2g6OF0uanMnLFxuICAgICAgICAgIGFzc2V0RmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaDo4XS5bZXh0XScsXG4gICAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgICAnbWFwYm94JzogWydtYXBib3gtZ2wnXSxcbiAgICAgICAgICAgICd2ZW5kb3InOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC1yb3V0ZXItZG9tJ10sXG4gICAgICAgICAgICAndWknOiBbJ0ByYWRpeC11aS9yZWFjdC1kaWFsb2cnLCAnQHJhZGl4LXVpL3JlYWN0LWRyb3Bkb3duLW1lbnUnLCAnQHJhZGl4LXVpL3JlYWN0LXNlbGVjdCddXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBleHRlcm5hbDogWydAc3VwYWJhc2Uvc3RvcmFnZS1qcyddXG4gICAgICB9LFxuICAgICAgY29tbW9uanNPcHRpb25zOiB7XG4gICAgICAgIGluY2x1ZGU6IFsvbm9kZV9tb2R1bGVzL10sXG4gICAgICB9LFxuICAgICAgcmVwb3J0Q29tcHJlc3NlZFNpemU6IHRydWVcbiAgICB9LFxuICAgIGRlZmluZToge1xuICAgICAgJ3Byb2Nlc3MuZW52JzogZW52LFxuICAgICAgZ2xvYmFsOiAnZ2xvYmFsVGhpcydcbiAgICB9LFxuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgaW5jbHVkZTogWydyZWFjdCcsICdyZWFjdC1kb20nXSxcbiAgICAgIGV4Y2x1ZGU6IFsnbHVjaWRlLXJlYWN0JywgJ0BzdXBhYmFzZS9zdG9yYWdlLWpzJ11cbiAgICB9XG4gIH1cbn0pIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFtVyxTQUFTLGNBQWMsZUFBZTtBQUN6WSxPQUFPLFdBQVc7QUFDbEIsU0FBUyxlQUFlO0FBQ3hCLFNBQVMsdUJBQXVCO0FBQ2hDLFNBQVMsa0JBQWtCO0FBSjNCLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ3hDLFFBQU0sTUFBTSxRQUFRLE1BQU0sUUFBUSxJQUFJLEdBQUcsRUFBRTtBQUUzQyxTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsTUFDUCxNQUFNO0FBQUEsTUFDTixTQUFTLGlCQUFpQixnQkFBZ0I7QUFBQSxNQUMxQyxTQUFTLGdCQUFnQixXQUFXO0FBQUEsUUFDbEMsVUFBVTtBQUFBLFFBQ1YsTUFBTTtBQUFBLFFBQ04sVUFBVTtBQUFBLFFBQ1YsWUFBWTtBQUFBLE1BQ2QsQ0FBQztBQUFBLElBQ0gsRUFBRSxPQUFPLE9BQU87QUFBQSxJQUNoQixTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCx3QkFBd0I7QUFBQSxRQUN4QixLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLE1BQ2pDO0FBQUEsTUFDQSxRQUFRLENBQUMsU0FBUyxXQUFXO0FBQUEsSUFDL0I7QUFBQSxJQUNBLFFBQVE7QUFBQTtBQUFBLE1BRU4sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sWUFBWTtBQUFBLE1BQ1osTUFBTTtBQUFBLE1BQ04sS0FBSztBQUFBLFFBQ0gsVUFBVTtBQUFBLFFBQ1YsTUFBTTtBQUFBLFFBQ04sTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBLE9BQU87QUFBQSxRQUNMLFlBQVk7QUFBQSxNQUNkO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsYUFBYSxFQUFFLDRCQUE0QixTQUFTO0FBQUEsTUFDcEQsUUFBUTtBQUFBLE1BQ1IsR0FBSSxTQUFTLGdCQUFnQjtBQUFBLFFBQzNCLGFBQWE7QUFBQSxVQUNYLGlCQUFpQjtBQUFBLFlBQ2YsY0FBYztBQUFBLFlBQ2QsZ0JBQWdCO0FBQUEsWUFDaEIsb0JBQW9CO0FBQUEsWUFDcEIsUUFBUTtBQUFBLFVBQ1Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLHVCQUF1QjtBQUFBLE1BQ3ZCLFFBQVE7QUFBQSxNQUNSLFFBQVE7QUFBQSxNQUNSLGNBQWM7QUFBQSxNQUNkLFdBQVc7QUFBQSxNQUNYLGVBQWU7QUFBQSxRQUNiLFFBQVE7QUFBQSxVQUNOLFFBQVE7QUFBQSxVQUNSLGdCQUFnQjtBQUFBLFVBQ2hCLGdCQUFnQjtBQUFBLFVBQ2hCLGdCQUFnQjtBQUFBLFVBQ2hCLGNBQWM7QUFBQSxZQUNaLFVBQVUsQ0FBQyxXQUFXO0FBQUEsWUFDdEIsVUFBVSxDQUFDLFNBQVMsYUFBYSxrQkFBa0I7QUFBQSxZQUNuRCxNQUFNLENBQUMsMEJBQTBCLGlDQUFpQyx3QkFBd0I7QUFBQSxVQUM1RjtBQUFBLFFBQ0Y7QUFBQSxRQUNBLFVBQVUsQ0FBQyxzQkFBc0I7QUFBQSxNQUNuQztBQUFBLE1BQ0EsaUJBQWlCO0FBQUEsUUFDZixTQUFTLENBQUMsY0FBYztBQUFBLE1BQzFCO0FBQUEsTUFDQSxzQkFBc0I7QUFBQSxJQUN4QjtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sZUFBZTtBQUFBLE1BQ2YsUUFBUTtBQUFBLElBQ1Y7QUFBQSxJQUNBLGNBQWM7QUFBQSxNQUNaLFNBQVMsQ0FBQyxTQUFTLFdBQVc7QUFBQSxNQUM5QixTQUFTLENBQUMsZ0JBQWdCLHNCQUFzQjtBQUFBLElBQ2xEO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
